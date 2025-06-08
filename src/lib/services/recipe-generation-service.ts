import {GoogleGenAI} from '@google/genai';
import { createRecipeModel } from "@/lib/model-factory"
import { HumanMessage, MessageContent, SystemMessage } from "@langchain/core/messages"
import { hostedImageToBase64 } from "@/lib/utils"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { GeneratedRecipe } from "@/lib/types"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"
import Langfuse from "langfuse"
import { createAdminClient } from '@/utils/supabase/server';
import { ChatOpenAI } from '@langchain/openai';
import { CallbackHandler } from 'langfuse-langchain';

// Value-probability pair type
interface ValueProbability {
    value: string;
    probability: number;
}

// Config type: key to array of value-probability pairs
interface SampleConfig {
    [key: string]: ValueProbability[];
}

interface LangFusePromptConfig {
    random_values: SampleConfig
}

export class RecipeGenerationService {
    private langfuse: Langfuse
    private recipeModel: Runnable<BaseLanguageModelInput, GeneratedRecipe, RunnableConfig<Record<string, unknown>>>

    constructor() {
        this.langfuse = new Langfuse()
        this.recipeModel = createRecipeModel()
    }

    private async getPromptAndMessages(text: string, imageUrl: string | null) {
        const promptClient = await this.langfuse.getPrompt("GenerateRecipe", undefined, { type: "text" })
        const prompt = new SystemMessage(await promptClient.compile())

        const content: MessageContent = [
            {
                type: "text",
                text: text,
            },
        ]

        if (imageUrl) {
            const base64Image = await hostedImageToBase64(imageUrl)

            content.push({
                type: "image_url",
                image_url: { url: base64Image, detail: "high" },
            })
        }

        const messages = [
            new HumanMessage({
                content: content
            }),
        ]

        return { prompt, messages }
    }

    async generateStreaming(text: string, imageUrl: string | null) {
        const { prompt, messages } = await this.getPromptAndMessages(text, imageUrl)
        return this.recipeModel.streamEvents([prompt, ...messages], {
            version: "v2",
            callbacks: [new CallbackHandler()]
        })
    }

    async generateBlocking(text: string, imageUrl: string | null) {
        const { prompt, messages } = await this.getPromptAndMessages(text, imageUrl)
        const recipe = await this.recipeModel.invoke([prompt, ...messages], {
            callbacks: [new CallbackHandler()]
        })
        return recipe
    }

    private sampleRandomValues(config: SampleConfig): Record<string, string> {
        const sampledValues: Record<string, string> = {};
        for (const key in config) {
            const valueProbabilities = config[key];
            const totalProbability = valueProbabilities.reduce((sum, vp) => sum + vp.probability, 0);
            if (Math.abs(totalProbability - 1) > 1e-8) {
                throw new Error(`Probabilities for key '${key}' must sum up to 1`);
            }
            const randomValue = Math.random();
            let cumulativeProbability = 0;
            for (const vp of valueProbabilities) {
                cumulativeProbability += vp.probability;
                if (randomValue <= cumulativeProbability) {
                    sampledValues[key] = vp.value;
                    break;
                }
            }
        }
        return sampledValues;
    }

    private async uploadImage(imageFile: Buffer) {
        const supabase = await createAdminClient()

        const { data, error } = await supabase.storage
            .from("recipe-images")
            .upload(`${crypto.randomUUID()}.png`, imageFile, {
                contentType: "image/png",
            })

        if (error) {
            throw new Error(`Failed to upload image: ${error.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
            .from("recipe-images")
            .getPublicUrl(data.path)

        return publicUrl
    }

    private async getImagePrompts(text: string, promptVariables: Record<string, string> | null = null) {
        const openai = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const langfuse = new Langfuse()

        const textToImagePromptClient = await langfuse.getPrompt("WriteImagePrompt", undefined, { type: "chat" })
        const negativeImagePrompt = (await langfuse.getPrompt("NegativeImage", undefined, { type: "text" })).compile()
        
        const config = textToImagePromptClient.config as LangFusePromptConfig

        const finalPromptVariables = promptVariables || this.sampleRandomValues(config.random_values)

        const textToImagePrompt = await textToImagePromptClient.compile({...finalPromptVariables, recipe: text})

        const openaiResponse = await openai.invoke(textToImagePrompt, {
            response_format: { type: "text" },
            callbacks: [new CallbackHandler()]
        })

        // TODO: better typing
        const positivePrompt = openaiResponse.content as string

        return { positivePrompt, negativeImagePrompt }
    }

    async generateThumbnail(text: string, promptVariables: Record<string, string> | null = null) {
        const { positivePrompt, negativeImagePrompt } = await this.getImagePrompts(text, promptVariables)

        const ai = new GoogleGenAI({vertexai: true,
            project: "bonchef-434908",
            location: "us-central1",
        })

        const response = await ai.models.generateImages(
            {
                model: "imagen-3.0-generate-002",
                prompt: positivePrompt,
                config: {
                    outputMimeType: "image/png",
                    negativePrompt: negativeImagePrompt,
                }
            }
        )

        if (!response.generatedImages) {
            throw new Error("No image generated")
        }
        
        const imageBytes = response.generatedImages[0].image?.imageBytes

        if (!imageBytes) {
            throw new Error("No image bytes generated")
        }

        const buffer = Buffer.from(imageBytes, "base64")

        const publicUrl = await this.uploadImage(buffer)

        return publicUrl
    }
}

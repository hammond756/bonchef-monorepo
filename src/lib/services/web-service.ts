import Langfuse from "langfuse"
import CallbackHandler from "langfuse-langchain"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { GeneratedRecipe, GeneratedRecipeSchema } from "../types"
import { JSDOM } from "jsdom"
import { Defuddle } from "defuddle/node"
import { Recipe as SchemaOrgRecipe } from "schema-dts"
import { unitTranslations } from "@/lib/translations"

type GeneratedRecipeWithSource = GeneratedRecipe & { source_name: string; source_url: string }

function translateRecipeUnits<T extends GeneratedRecipe>(recipe: T): T {
    return {
        ...recipe,
        ingredients: recipe.ingredients.map((group) => ({
            ...group,
            ingredients: group.ingredients.map((ingredient) => {
                const lowerCaseUnit = ingredient.unit.toLowerCase()
                const translatedUnit = unitTranslations[lowerCaseUnit]
                return {
                    ...ingredient,
                    unit: translatedUnit || ingredient.unit,
                }
            }),
        })),
    }
}

export async function formatRecipe(
    text: string
): Promise<{ recipe: GeneratedRecipeWithSource; thumbnailUrl: string }> {
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4.1-mini",
        temperature: 0.1,
        maxTokens: 4096,
    }).withStructuredOutput(
        z.object({
            recipe: GeneratedRecipeSchema.extend({
                source_name: z.string(),
                source_url: z.string(),
            }),
            thumbnailUrl: z.string(),
        })
    )

    const langfuse = new Langfuse()
    const promptClient = await langfuse.getPrompt("ExtractRecipeFromWebcontent", undefined, {
        type: "chat",
    })
    const prompt = promptClient.compile({ input: text })

    try {
        const result = await model.invoke(prompt, { callbacks: [new CallbackHandler()] })
        const translatedRecipe = translateRecipeUnits(result.recipe)
        return {
            ...result,
            recipe: translatedRecipe,
        }
    } catch (error: unknown) {
        // const errorMessage = error?.message || error?.response?.data?.error?.message || "";

        // if (errorMessage.includes("maximum context length")) {
        //   console.warn("Context length exceeded, returning original content...");
        //   return text
        // }

        throw error
    }
}

export async function getRecipeContent(url: string) {
    let recipeData = ""

    const webContent = await JSDOM.fromURL(url)
    const defuddledResult = await Defuddle(webContent)
    const recipeSchemaOrgData: SchemaOrgRecipe[] = defuddledResult.schemaOrgData.filter(
        (item: { "@type": string }) => item["@type"] === "Recipe"
    )

    if (!recipeSchemaOrgData.length) {
        console.warn(`No recipe schema org data found on site: ${url}, using defuddled content`)
        recipeData = defuddledResult.content
    } else {
        recipeData = JSON.stringify(recipeSchemaOrgData)
    }

    return recipeData
}

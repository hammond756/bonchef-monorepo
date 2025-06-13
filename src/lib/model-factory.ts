import { ChatOpenAI } from "@langchain/openai"
import { FakeListChatModel } from "@langchain/core/utils/testing"
import {
    LLMResponseSchema,
    IntentResponseSchema,
    LLMResponse,
    IntentResponse,
    GeneratedRecipeSchema,
    GeneratedRecipe,
} from "./types"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"

export interface ChatModelSet {
    smart: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, unknown>>>
    fast: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, unknown>>>
    intentModel: Runnable<
        BaseLanguageModelInput,
        IntentResponse,
        RunnableConfig<Record<string, unknown>>
    >
}

function createTestModels(): ChatModelSet {
    const fakeGPT4 = new FakeListChatModel({
        responses: [
            JSON.stringify({
                messages: [
                    {
                        content: "Hier is een recept...",
                        type: "recipe",
                    },
                    {
                        content: "Hier is een teaser...",
                        type: "teaser",
                    },
                ],
            }),
        ],
        sleep: 1000,
    }).withStructuredOutput(LLMResponseSchema)

    const fakeGPT35 = new FakeListChatModel({
        responses: [
            JSON.stringify({
                messages: [
                    {
                        content: "Dit is een antwoord op je vraag...",
                        type: "text",
                    },
                ],
            }),
        ],
        sleep: 1000,
    }).withStructuredOutput(LLMResponseSchema)

    const fakeIntentModel = new FakeListChatModel({
        responses: [JSON.stringify({ intent: "recipe" })],
    }).withStructuredOutput(IntentResponseSchema)

    return {
        smart: fakeGPT4,
        fast: fakeGPT35,
        intentModel: fakeIntentModel,
    }
}

function createProductionModels(): ChatModelSet {
    const smart = new ChatOpenAI({
        modelName: "gpt-4o",
        streaming: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxTokens: 4096,
    }).withStructuredOutput(LLMResponseSchema, {
        name: "response",
        strict: true,
        method: "jsonSchema",
    })

    const fast = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        streaming: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxTokens: 4096,
    }).withStructuredOutput(LLMResponseSchema, {
        name: "response",
        strict: true,
        method: "jsonSchema",
    })

    const intentModel = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        streaming: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    }).withStructuredOutput(IntentResponseSchema, {
        name: "response",
        strict: true,
        method: "jsonSchema",
    })

    return {
        smart,
        fast,
        intentModel,
    }
}

export function createChatModels(): ChatModelSet {
    switch (process.env.NODE_ENV) {
        case "test":
            return createTestModels()
        case "development":
            // You could return either test or production models for development
            // depending on your needs
            return process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true"
                ? createTestModels()
                : createProductionModels()
        default:
            return createProductionModels()
    }
}

export function createTestRecipeModel(
    recipe?: GeneratedRecipe
): Runnable<BaseLanguageModelInput, GeneratedRecipe, RunnableConfig<Record<string, unknown>>> {
    const DEV_RECIPE: GeneratedRecipe = {
        title: "Classic Spaghetti Bolognese",
        total_cook_time_minutes: 60,
        n_portions: 4,
        ingredients: [
            {
                name: "Pasta",
                ingredients: [
                    {
                        description: "Spaghetti",
                        quantity: { type: "range", low: 400, high: 400 },
                        unit: "gram",
                    },
                ],
            },
            // ... existing code for other ingredient groups ...
        ],
        instructions: [
            "Fill a large pot with water, add 1-2 tablespoons of salt, and bring to a rolling boil for cooking the pasta",
            // ... existing code for other instructions ...
        ],
    }

    return new FakeListChatModel({
        responses: [JSON.stringify(recipe || DEV_RECIPE)],
    }).withStructuredOutput(GeneratedRecipeSchema, {
        name: "response",
    })
}

function createProductionRecipeModel(
    modelName: string,
    streaming: boolean
): Runnable<BaseLanguageModelInput, GeneratedRecipe, RunnableConfig<Record<string, unknown>>> {
    return new ChatOpenAI({
        modelName: modelName,
        streaming: streaming,
        openAIApiKey: process.env.OPENAI_API_KEY,
    }).withStructuredOutput(GeneratedRecipeSchema, {
        name: "response",
        strict: true,
        method: "jsonSchema",
    })
}

export function createRecipeModel(
    modelName: string = "gpt-4o",
    streaming: boolean = true
): Runnable<BaseLanguageModelInput, GeneratedRecipe, RunnableConfig<Record<string, unknown>>> {
    switch (process.env.NODE_ENV) {
        case "test":
            return createTestRecipeModel()
        case "development":
            return process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true"
                ? createTestRecipeModel()
                : createProductionRecipeModel(modelName, streaming)
        default:
            return createProductionRecipeModel(modelName, streaming)
    }
}

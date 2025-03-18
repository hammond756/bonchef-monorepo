import { ChatOpenAI } from "@langchain/openai"
import { FakeListChatModel } from "@langchain/core/utils/testing"
import { LLMResponseSchema, IntentResponseSchema, LLMResponse, IntentResponse } from "./types"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"

export interface ChatModelSet {
  smart: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, any>>>;
  fast: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, any>>>;
  intentModel: Runnable<BaseLanguageModelInput, IntentResponse, RunnableConfig<Record<string, any>>>;
}

function createTestModels(): ChatModelSet {
  const fakeGPT4 = new FakeListChatModel({
    responses: [
      JSON.stringify({
        messages: [{
          content: "Hier is een recept...",
          type: "recipe"
        }]
      })
    ],
    sleep: 1000
  }).withStructuredOutput(LLMResponseSchema)

  const fakeGPT35 = new FakeListChatModel({
    responses: [
      JSON.stringify({
        messages: [{
          content: "Dit is een antwoord op je vraag...",
          type: "text"
        }]
      })
    ],
    sleep: 1000
  }).withStructuredOutput(LLMResponseSchema)

  const fakeIntentModel = new FakeListChatModel({
    responses: [JSON.stringify({intent: "recipe"})]
  }).withStructuredOutput(IntentResponseSchema)

  return {
    smart: fakeGPT4,
    fast: fakeGPT35,
    intentModel: fakeIntentModel
  }
}

function createProductionModels(): ChatModelSet {
  const smart = new ChatOpenAI({
    modelName: "gpt-4o",
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4096
  }).withStructuredOutput(LLMResponseSchema, {
    name: "response",
    strict: true
  })

  const fast = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4096
  }).withStructuredOutput(LLMResponseSchema, {
    name: "response",
    strict: true
  })

  const intentModel = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
  }).withStructuredOutput(IntentResponseSchema, {
    name: "response",
    strict: true
  })

  return {
    smart,
    fast,
    intentModel
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
import { UserInput, LLMResponse, IntentResponse } from "./types"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"
import { 
  SystemMessage, 
  HumanMessage, 
  AIMessage,
} from "@langchain/core/messages"
import { createChatModels, ChatModelSet } from "./model-factory"
import { CallbackHandler } from "langfuse-langchain"
import { HistoryService } from "./services/history-service"
import { HistoryCallbackHandler } from "./callbacks/history-callback"
import { TextPromptClient, Langfuse } from "langfuse"

const langfuse = new Langfuse()

export class CulinaryAgent {
  private smart: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, unknown>>>
  private fast: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, unknown>>>
  private intentModel: Runnable<BaseLanguageModelInput, IntentResponse, RunnableConfig<Record<string, unknown>>>
  private prompts!: Record<string, TextPromptClient>
  private langfuseHandler: CallbackHandler
  private historyService: HistoryService
  private langfuse: Langfuse

  constructor(config?: Partial<ChatModelSet>) {
    const defaultModels = createChatModels()
    
    this.smart = config?.smart ?? defaultModels.smart
    this.fast = config?.fast ?? defaultModels.fast
    this.intentModel = config?.intentModel ?? defaultModels.intentModel
    this.langfuseHandler = new CallbackHandler()
    this.historyService = new HistoryService()
    this.langfuse = new Langfuse()
  }

  private async initializePrompts() {
    this.prompts = {
      other: await langfuse.getPrompt("OtherIntent", undefined, {type: "text"}),
      teaser: await langfuse.getPrompt("TeaserIntent", undefined, {type: "text"}),
      recipe: await langfuse.getPrompt("RecipeIntent", undefined, {type: "text"}),
      modify: await langfuse.getPrompt("ModifyIntent", undefined, {type: "text"}),
      question: await langfuse.getPrompt("QuestionIntent", undefined, {type: "text"}),
      introduction: await langfuse.getPrompt("IntroductionIntent", undefined, {type: "text"}),
    }
  }

  private async detectIntent(history: (HumanMessage | AIMessage)[]): Promise<string> {
    const intentClassifierPrompt = await this.langfuse.getPrompt("IntentClassifier", undefined, {type: "text"})
    const messages = [
      new SystemMessage(intentClassifierPrompt.compile()),
      ...history
    ]
    
    const aiResponse = await this.intentModel.invoke(messages, {
      callbacks: [this.langfuseHandler]
    })
    const intent = aiResponse.intent
    console.log("Intent detected:", intent)
    return intent
  }

  async processMessage(
    userInput: UserInput,
    conversationId: string,
  ) {
    // Needs to happen as part of the request cycle in order for changes
    // in langfuse to me immediately in effect
    await this.initializePrompts()

    // Get conversation history, do this first to get the last message order
    const historyMessages = await this.historyService.getHistory(conversationId)
    const lastMessageOrder = historyMessages[historyMessages.length - 1]?.order ?? 0

    // Add user message to history
    const userMessage = await this.historyService.addUserMessage(
      conversationId,
      userInput.message,
      { webContent: userInput.webContent, image: userInput.image },
      lastMessageOrder
    )

    historyMessages.push(userMessage)

    const agentHistory = await this.historyService.toAgentHistory(historyMessages)
    
    const intent = await this.detectIntent(agentHistory)
    
    // Use GPT-4 for complex tasks
    const model = ["recipe", "teaser"].includes(intent) ? this.smart : this.fast
    const systemMessage = this.prompts[intent].compile()

    if (!systemMessage) {
      console.error("No prompt found for intent:", intent)
      throw new Error("No prompt found for intent: " + intent)
    }

    const messages = [
      new SystemMessage(systemMessage),
      ...agentHistory
    ]

    const historyCallback = new HistoryCallbackHandler(conversationId, lastMessageOrder, this.historyService)

    return model.streamEvents(
      messages,
      {
        version: "v2",
        encoding: "text/event-stream",
        callbacks: [this.langfuseHandler, historyCallback]
      }
    )
  }
} 
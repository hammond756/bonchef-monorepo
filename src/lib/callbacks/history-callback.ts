import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { LLMResponse } from "../types"
import { HistoryService } from "../services/history-service"

export class HistoryCallbackHandler extends BaseCallbackHandler {
  name = "HistoryCallbackHandler"

  constructor(
    private conversationId: string,
    private historyService: HistoryService
  ) {
    super()
  }

  async handleChainEnd(outputs: LLMResponse, runId: string, parentRunId?: string, tags?: string[], kwargs?: {
    inputs?: Record<string, unknown>;
  }) {
    if (parentRunId) {
      return 
    }

    if (!outputs.messages) {
      return 
    }

    const start = performance.now()

    for (const message of outputs.messages) {
      if (message.content && message.type) {
        await this.historyService.addBotMessage(this.conversationId, message.content, { type: message.type })
      }
    }

    const end = performance.now()
    console.log(`Time taken: ${end - start} milliseconds`)
  }
} 
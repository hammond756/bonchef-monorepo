import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { LLMResponse } from "../types"
import { HistoryService } from "../services/history-service"

export class HistoryCallbackHandler extends BaseCallbackHandler {
    name = "HistoryCallbackHandler"

    constructor(
        private conversationId: string,
        private lastMessageOrder: number,
        private historyService: HistoryService
    ) {
        super()
    }

    async handleChainEnd(
        outputs: LLMResponse,
        _runId: string,
        parentRunId?: string,
        _tags?: string[],
        _kwargs?: {
            inputs?: Record<string, unknown>
        }
    ) {
        if (parentRunId) {
            return
        }

        if (!outputs.messages) {
            return
        }

        const newMessages = []

        const start = performance.now()

        // These updates are too slow for the frontend to revalidate within
        // a reasonable time (1000ms). So we need to optimize this.
        // Option 1: use a posgress function to offload the work to the database
        // Option 2: save message n when we're generating n+1 (keep track of the index in memory)
        // Option 3: pass the last message index to the callback handler and manage the order
        // field ourselves. Then we can parallelize the updates [await (order: 1), await(order: 2)].gather()
        for (const message of outputs.messages) {
            if (message.content && message.type) {
                const order: number = this.lastMessageOrder + newMessages.length + 1
                newMessages.push(
                    this.historyService.addBotMessage(
                        this.conversationId,
                        message.content,
                        { type: message.type },
                        order
                    )
                )
            }
        }

        await Promise.all(newMessages)

        const end = performance.now()
        console.log(`Time taken: ${end - start} milliseconds`)
    }
}

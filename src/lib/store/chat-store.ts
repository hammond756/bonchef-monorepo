import { create } from "zustand"
import { persist, type StateStorage } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import { ChatMessageData, HistoryMessage } from "@/lib/types"

interface ChatStore {
  messages: ChatMessageData[]
  conversationId: string
  setMessages: (messages: ChatMessageData[] | ((prev: ChatMessageData[]) => ChatMessageData[])) => void
  clearConversation: () => void
  getConversationHistory: () => HistoryMessage[]
}

type ChatState = Pick<ChatStore, "messages" | "conversationId">

export const useChatStore = create<ChatStore>()(
  persist<ChatStore>(
    (set, get) => ({
      messages: [],
      conversationId: uuidv4(),
      setMessages: (messages) => set(
        typeof messages === "function" 
          ? { messages: messages(get().messages) }
          : { messages }
      ),
      clearConversation: () => set({ messages: [], conversationId: uuidv4() }),
      getConversationHistory: () => {
        return get().messages
          .map((message: ChatMessageData): HistoryMessage | null => {
            if (message.type === "user") {
              return {
                role: "user",
                content: message.userInput.message,
                timestamp: new Date(),
              }
            } else if (message.type === "bot") {
              return {
                role: "assistant",
                content: message.botResponse.content,
                timestamp: new Date(),
              }
            }
            return null
          })
          .filter((msg: HistoryMessage | null): msg is HistoryMessage => msg !== null)
      },
    }),
    {
      name: "chat-storage",
    }
  )
) 
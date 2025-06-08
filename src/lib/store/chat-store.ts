import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

interface ChatStore {
  conversationId: string
  clearConversation: () => void
}

export const useChatStore = create<ChatStore>()(
  persist<ChatStore>(
    (set) => ({
      conversationId: uuidv4(),
      clearConversation: () => set({ conversationId: uuidv4() }),
    }),
    {
      name: "chat-storage",
    }
  )
)
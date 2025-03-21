import { createClient } from "@/utils/supabase/server"
import { HumanMessage, AIMessage } from "@langchain/core/messages"

export interface ConversationMessage {
  message_id: string
  conversation_id: string
  user_id: string
  type: "user" | "bot"
  content: string
  payload: Record<string, any>
  order: number
  archived: boolean
  created_at: string
}

export class HistoryService {
  async addUserMessage(
    conversationId: string,
    content: string,
    payload: Record<string, any> = {}
  ): Promise<ConversationMessage> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Unauthorized edit to conversation history")
    }
    
    const { data, error } = await supabase
      .from("conversation_history")
      .insert({
        conversation_id: conversationId,
        user_id: user?.id,
        type: "user",
        content,
        payload
      })
      .select()
      .single()
      
    if (error) {
      throw new Error(`Failed to add user message: ${error.message}`)
    }
    
    return data
  }
  
  async addBotMessage(
    conversationId: string,
    content: string,
    payload: Record<string, any> = {}
  ): Promise<ConversationMessage> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Unauthorized edit to conversation history")
    }
    
    const { data, error } = await supabase
      .from("conversation_history")
      .insert({
        conversation_id: conversationId,
        user_id: user?.id,
        type: "bot",
        content,
        payload
      })
      .select()
      .single()
      
    if (error) {
      throw new Error(`Failed to add bot message: ${error.message}`)
    }

    console.log("saved bot message ---", content.slice(0, 60).replace(/\n/g, " "))
    
    return data
  }
  
  async getHistory(conversationId: string): Promise<ConversationMessage[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("conversation_history")
      .select()
      .eq("conversation_id", conversationId)
      .order("order", { ascending: true })
      
    if (error) {
      throw new Error(`Failed to get conversation history: ${error.message}`)
    }
    
    return data
  }
  
  async archiveConversation(conversationId: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("conversation_history")
      .update({ archived: true })
      .eq("conversation_id", conversationId)
      
    if (error) {
      throw new Error(`Failed to archive conversation: ${error.message}`)
    }
  }
  
  toAgentHistory(messages: ConversationMessage[]): (HumanMessage | AIMessage)[] {
    const agentMessages: (HumanMessage | AIMessage)[] = []
    
    for (const message of messages) {
      if (message.type === "user") {
        agentMessages.push(new HumanMessage(message.content))
        
        // If message has webContent in payload, add it as separate messages
        const webContent = message.payload?.webContent
        if (Array.isArray(webContent)) {
          for (const content of webContent) {
            agentMessages.push(
              new HumanMessage(
                `Relevante content van het web:\n\nURL: ${content.url}\nInhoud: ${content.content}`
              )
            )
          }
        }
      } else {
        agentMessages.push(new AIMessage(message.content))
      }
    }
    
    return agentMessages
  }
} 
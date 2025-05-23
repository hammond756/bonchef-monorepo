import { createClient } from "@/utils/supabase/server"
import { HumanMessage, AIMessage, MessageContentComplex } from "@langchain/core/messages"
import { GeneratedRecipe } from "../types"
import { hostedImageToBase64, resignImageUrl } from "../utils"

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
    payload: Record<string, any> = {},
    order: number
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
        payload,
        order
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
    payload: Record<string, any> = {},
    order: number
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
        payload,
        order
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

  private templateTeaserWithRecipe(content: string, recipe: GeneratedRecipe): string {
    return `
      A recipe teaser:
      ${content}
      
      That resulted in this full recipe:
      ${JSON.stringify(recipe)}
    `
  }

  async toAgentHistory(messages: ConversationMessage[]): Promise<(HumanMessage | AIMessage)[]> {
    const agentMessages: (HumanMessage | AIMessage)[] = []
    const supabase = await createClient()
    
    for (const message of messages) {
      if (message.type === "user") {
        const messageContent: MessageContentComplex[] = [
          {
            type: "text",
            text: message.content
          }
        ]

        if (message.payload?.image) {
          const signedUrl = await resignImageUrl(supabase, message.payload.image.url)
          const base64Image = await hostedImageToBase64(signedUrl)
          console.log("base64Image", `data:${message.payload.image.type};base64,${base64Image.slice(0, 100)}`)
          messageContent.push({
            type: "image_url",
            image_url: {
              url: `data:${message.payload.image.type};base64,${base64Image}`,
              detail: "high"
            }
          })
        }

        agentMessages.push(new HumanMessage({content: messageContent}))
        
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
        if (message.payload.type === "teaser" && message.payload.recipe) {
          agentMessages.push(new AIMessage(this.templateTeaserWithRecipe(message.content, message.payload.recipe)))
        } else {
          agentMessages.push(new AIMessage(message.content))
        }
      }
    }
    
    return agentMessages
  }
}

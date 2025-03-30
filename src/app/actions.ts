"use server"

import { HistoryService } from "@/lib/services/history-service"
import { ChatMessageData, GeneratedRecipe, ResponseMessage } from "@/lib/types"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = cookies()
  const supabase = await createClient()

  await supabase.auth.signOut()
  redirect("/login")
} 

export async function getRecipes(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("user_id", userId)
  return data
}

export async function getPublicRecipes(page = 1, pageSize = 10) {
  const supabase = await createClient()
  
  // Calculate pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Fetch public recipes with profiles join
  const { data, error, count } = await supabase
    .from("recipe_creation_prototype")
    .select("*, profiles!recipe_creation_prototype_user_id_fkey(display_name)", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to)
  
  if (error) {
    console.error("Error fetching public recipes:", error)
    return { data: [], count: 0 }
  }
  
  return { data, count }
}

export async function fetchConversationHistory(conversationId: string): Promise<ChatMessageData[]> {
  const historyService = new HistoryService()
  const history = await historyService.getHistory(conversationId)
  return history.map((message) => {
    if (message.type === "user") {
      return {
        id: message.message_id,
        type: message.type,
        userInput: {
          message: message.content,
          webContent: message.payload.webContent
        },
      }
    } else {
      try {
        const payload = {
          type: message.payload.type,
          recipe: message.payload.recipe
        }

        console.log("payload", payload)
        
        return {
          id: message.message_id,
          type: message.type,
          botResponse: {
            content: message.content,
            payload
          }
        }
      } catch (error) {
        console.error("Error parsing bot response:", error)
        return {
          id: message.message_id,
          type: message.type,
          botResponse: {
            content: "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
            payload: {
              type: "text"
            }
          }
        }
      }
    }
  })
}

export async function patchMessagePayload(messageId: string, payload: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase.rpc("patch_message_payload", {
    p_message_id: messageId,
    p_payload: payload
  })
  
  if (error) {
    console.error("Error patching message payload:", error)
    throw error
  }
}

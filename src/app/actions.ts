"use server"

import { createRecipeModel } from "@/lib/model-factory"
import { HistoryService } from "@/lib/services/history-service"
import { ChatMessageData, GeneratedRecipe, UserInput } from "@/lib/types"
import { createClient } from "@/utils/supabase/server"
import { Langfuse } from "langfuse"
import { CallbackHandler } from "langfuse-langchain"
import { redirect } from "next/navigation"

export async function logout() {
    const supabase = await createClient()

    await supabase.auth.signOut()
    redirect("/login")
}

export async function getRecipes(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from("recipe_creation_prototype")
        .select("*, is_liked_by_current_user")
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
        .select("*, profiles!recipe_creation_prototype_user_id_fkey(display_name)", {
            count: "exact",
        })
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
            const userInput: UserInput = {
                message: message.content,
                webContent: [],
                image: undefined,
            }

            if ("webContent" in message.payload) {
                userInput.webContent = message.payload.webContent
            }

            if ("image" in message.payload) {
                userInput.image = message.payload.image
            }

            return {
                id: message.message_id,
                type: message.type,
                userInput,
            }
        } else {
            try {
                return {
                    id: message.message_id,
                    type: message.type,
                    botResponse: {
                        content: message.content,
                        payload: message.payload,
                    },
                }
            } catch (error) {
                console.error("Error parsing bot response:", error)
                return {
                    id: message.message_id,
                    type: message.type,
                    botResponse: {
                        content: "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
                        payload: {
                            type: "text",
                        },
                    },
                }
            }
        }
    })
}

export type PayloadPatchRequest = {
    recipe?: GeneratedRecipe
    type?: string
}

export async function patchMessagePayload(messageId: string, payload: PayloadPatchRequest) {
    const supabase = await createClient()
    const { error } = await supabase.rpc("patch_message_payload", {
        p_message_id: messageId,
        p_payload: payload,
    })

    if (error) {
        console.error("Error patching message payload:", error)
        throw error
    }
}

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

export type WriteStyle = "professioneel" | "thuiskok"

export async function formatRecipe(recipeText: string) {
    if (
        process.env.NODE_ENV != "production" &&
        process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true"
    ) {
        return DEV_RECIPE
    }

    const langfuse = new Langfuse()

    const promptClient = await langfuse.getPrompt("FormatRecipe", undefined, { type: "chat" })
    const prompt = promptClient.compile({ input: recipeText })

    const recipeModel = createRecipeModel("gpt-4o-mini", false)

    console.log("Generating recipe...", recipeText)
    const recipe = await recipeModel.invoke(prompt, { callbacks: [new CallbackHandler()] })

    return recipe
}

"use server"

import { UserInput } from "@/lib/types"

export async function sendChatMessage(userInput: UserInput, conversationId: string) {

  let message = ""

  if (userInput.webContent.length > 0) {
    message += "Deze websites worden door de gebruiker genoemd in hun bericht. Gebruik deze inhoud om de reactie te verbeteren.\n"
    for (const content of userInput.webContent) {
      message += `${content.url}\n${content.content}\n\n`
    }
    message += "_".repeat(80) + "\n"
    message += "_".repeat(80) + "\n\n"
  }

  message += userInput.message

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message, conversationId, modelName: "o1" }),
      }
    )

    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      console.log(await response.text())
      return { success: false, error: "Invalid response format" }
    }

    const data = await response.json()
    return { success: true, output: data.output }
  } catch (error) {
    console.error("Failed to send message:", error)
    return { success: false, error: "Failed to send message" }
  }
} 
"use server"

export async function sendChatMessage(text: string, conversationId: string, webContent: string[]) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text, conversationId }),
      }
    )

    const data = await response.json()
    return { success: true, output: data.output }
  } catch (error) {
    console.error("Failed to send message:", error)
    return { success: false, error: "Failed to send message" }
  }
} 
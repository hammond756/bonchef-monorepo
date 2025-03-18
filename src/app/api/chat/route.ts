import { CulinaryAgent } from "@/lib/agent"
import { HistoryMessage } from "@/lib/types"

export const POST = async (req: Request) => {
  console.log("Processing POST request...")
  const body = await req.text()
  const { userInput, conversationId, conversationHistory } = JSON.parse(body)

  const agent = new CulinaryAgent()

  // Convert the conversation history to the format expected by the agent
  const history: HistoryMessage[] = conversationHistory.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp)
  }))

  try {
    const stream = await agent.processMessage(userInput, history)

  return new Response(stream, {
    headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error processing message:", error)
    return new Response("Error processing message", { status: 500 })
  }
}

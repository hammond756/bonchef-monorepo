import { CulinaryAgent } from "@/lib/agent"

export const POST = async (req: Request) => {
    console.log("Processing POST request...")
    const body = await req.text()
    const { userInput, conversationId } = JSON.parse(body)

    const agent = new CulinaryAgent()

    try {
        console.log("Processing message...", userInput, conversationId)
        const stream = await agent.processMessage(userInput, conversationId)

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        })
    } catch (error) {
        console.error("Error processing message:", error)
        return new Response("Error processing message", { status: 500 })
    }
}

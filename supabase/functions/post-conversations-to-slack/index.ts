// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"
import { WebClient } from "https://deno.land/x/slack_web_api@6.7.2/mod.js"

const slackBotToken = Deno.env.get("SLACK_TOKEN") ?? ""
const botClient = new WebClient(slackBotToken)

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

console.log("Hello from Functions!")

Deno.serve(async (req) => {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString()

    const { data, error } = await supabase
        .from("conversation_history")
        .select("*")
        .gte("created_at", oneHourAgo)

    if (error) {
        console.error("DB query failed:", error)
        return new Response("Error querying conversation_history", { status: 500 })
    }

    // Group by conversation_id
    const grouped: Record<string, any[]> = {}
    for (const row of data) {
        const convoId = row.conversation_id
        if (!grouped[convoId]) grouped[convoId] = []
        grouped[convoId].push(row)
    }

    const conversationsSent = []

    for (const [convoId, messages] of Object.entries(grouped)) {
        messages.sort((a, b) => {
            const aOrder = a.order ?? Infinity
            const bOrder = b.order ?? Infinity
            return aOrder - bOrder || a.created_at.localeCompare(b.created_at)
        })

        const textBlocks = messages.map((msg) => {
            const who = msg.type === "bot" ? "🤖 *Bot*" : "🧑 *User*"
            const content =
                msg.type === "bot"
                    ? `(type: ${msg.payload?.type ?? "onbekend"})`
                    : (msg.content?.trim() ?? "")

            return `> ${who}\n\`\`\`\n${content}\n\`\`\``
        })

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `Gesprek: ${convoId}`,
                    emoji: true,
                },
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `🕒 Gesprek gestart na ${oneHourAgo.split("T")[0]} ${oneHourAgo.split("T")[1].slice(0, 5)}`,
                    },
                ],
            },
            {
                type: "divider",
            },
            ...textBlocks.flatMap((block, i) => [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: block,
                    },
                },
                ...(i < textBlocks.length - 1 ? [{ type: "divider" }] : []),
            ]),
        ]

        const payload = {
            channel: "C0888LJBJR1",
            blocks,
            text: `Nieuw gesprek: ${convoId}`,
        }

        const res = await botClient.chat.postMessage(payload)

        if (res.ok) {
            conversationsSent.push(convoId)
        } else {
            console.error(`Failed to send convo ${convoId}`, await res.text())
        }
    }

    return new Response(`Sent ${conversationsSent.length} conversation(s) to Slack`, {
        status: 200,
    })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post-conversations-to-slack' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

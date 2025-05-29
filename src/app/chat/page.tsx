import { Chat } from "@/components/chat";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/welcome")
    }
    return (
        <main className="flex flex-col h-[calc(100vh-var(--top-bar-height))] overflow-hidden">
            <Chat />
        </main>
    )
}
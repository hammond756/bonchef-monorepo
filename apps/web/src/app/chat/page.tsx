import { Chat } from "@/components/chat"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { PageContentSpacer } from "@/components/layout/page-content-spacer"

export default async function ChatPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        redirect("/welcome")
    }
    return (
        <>
            <PageContentSpacer />
            <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
                <Chat />
            </main>
        </>
    )
}

import { createClient } from "@/utils/supabase/server"
import { Chat } from "@/components/chat"
import { redirect } from "next/navigation"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  return <Chat />
}
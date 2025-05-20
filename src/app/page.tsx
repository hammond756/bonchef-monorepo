import { createClient } from "@/utils/supabase/server"
import { Chat } from "@/components/chat"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/welcome")
  }

  return <Chat />
}

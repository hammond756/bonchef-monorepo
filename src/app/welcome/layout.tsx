import { BaseLayout } from "@/components/layouts/base-layout"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function WelcomeLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect("/")
    }

    return <BaseLayout>{children}</BaseLayout>
}

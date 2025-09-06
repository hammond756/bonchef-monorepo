import { supabase } from "@/lib/utils/supabase/client"
import { Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export function useSession() {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            setSession(session)
            setIsLoading(false)
        }

        fetchSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
        return () => subscription.unsubscribe()
    }, [])

    return { session, isLoading }
}

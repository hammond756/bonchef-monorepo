import { createClient } from "@/utils/supabase/client"
import { type User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        // Get the user on mount
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user ?? null)
            setIsLoading(false)
        }

        getUser()

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])
    return { user, isLoading }
}

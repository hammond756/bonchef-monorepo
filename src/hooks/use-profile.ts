"use client"

import useSWR from "swr"
import { PublicProfile } from "@/lib/types"
import { useEffect } from "react"
import { getOwnProfile } from "@/components/profile/actions"
import { createClient } from "@/utils/supabase/client"

export async function fetchProfile(): Promise<PublicProfile | null> {
    return getOwnProfile()
}

export function useProfile() {
    const { data, error, isLoading, mutate } = useSWR<PublicProfile | null>(
        "profile",
        fetchProfile,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    )

    useEffect(() => {
        const supabase = createClient()
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            mutate()
        })
        return () => subscription.unsubscribe()
    }, [mutate])

    return {
        profile: data,
        isLoading,
        isError: error,
        refreshProfile: mutate,
    }
}

"use client"

import useSWR from "swr"
import { fetchConversationHistory } from "@/app/actions"
import type { ChatMessageData } from "@/lib/types"

const fetcher = async (conversationId: string) => {
  return await fetchConversationHistory(conversationId)
}

export function useConversationHistory(conversationId: string) {
  const { data, error, mutate } = useSWR<ChatMessageData[]>(
    conversationId,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate when window regains focus
      revalidateOnReconnect: true, // Revalidate when browser regains connection
      refreshInterval: 0, // Don't poll for updates
    }
  )

  return {
    history: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

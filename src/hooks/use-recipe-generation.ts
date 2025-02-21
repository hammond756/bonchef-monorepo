"use client"

import { useState, useEffect, useRef } from "react"
import { getTaskStatus } from "@/app/create/actions"
import type { GeneratedRecipe } from "@/lib/types"

interface UseRecipeGenerationProps {
  onSuccess: (recipe: GeneratedRecipe) => void
  onError: (error: string) => void
}

export function useRecipeGeneration({ onSuccess, onError }: UseRecipeGenerationProps = {onSuccess: (recipe: GeneratedRecipe) => {}, onError: (error: string) => {}}) {
  const [isLoading, setIsLoading] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (!taskId) return

    intervalRef.current = setInterval(async () => {
      try {
        const status = await getTaskStatus(taskId)
        setProgress(status.progress)

        if (status.status === "SUCCESS" && status.result) {
          onSuccess(status.result)
          setIsLoading(false)
          setTaskId(null)
          clearInterval(intervalRef.current!)
        } else if (status.status === "FAILURE") {
          onError("Failed to generate recipe")
          setIsLoading(false)
          setTaskId(null)
          clearInterval(intervalRef.current!)
        }
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "An error occurred")
        setIsLoading(false)
        setTaskId(null)
        clearInterval(intervalRef.current!)
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [taskId, onSuccess, onError])

  return {
    isLoading,
    setIsLoading,
    taskId,
    setTaskId,
    progress
  }
} 
import { useState, useCallback, useEffect, useRef } from "react"
import { EventSourceMessage, fetchEventSource } from "@microsoft/fetch-event-source"
import { GeneratedRecipe } from "@/lib/types"

interface UseRecipeGenerationProps {
    onStreaming?: (recipe: GeneratedRecipe) => void
    onComplete?: (recipe: GeneratedRecipe) => void
    onClose?: () => void
    onError?: (error: unknown) => void
}

export function useRecipeGeneration({
    onStreaming,
    onComplete,
    onClose,
    onError,
}: UseRecipeGenerationProps = {}) {
    const [isStreaming, setIsStreaming] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState("")
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    useEffect(() => {
        // Cleanup timer on unmount
        return () => clearTimer()
    }, [])

    const generateRecipe = useCallback(
        async (content: string) => {
            setIsStreaming(true)
            setIsCompleted(false)
            setHasError(false)
            setError(null)
            setStatusMessage("Recept schrijven...")
            clearTimer() // Clear any existing timer

            // Set a timer to update the message if it takes too long
            timerRef.current = setTimeout(() => {
                setStatusMessage(
                    "We zijn écht bezig met je recept, maar het duurt iets langer dan verwacht."
                )
            }, 25000) // 25 seconds

            try {
                await fetchEventSource("/api/public/generate-recipe", {
                    method: "POST",
                    body: JSON.stringify({ text: content }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    onmessage: (event: EventSourceMessage) => {
                        const generatedRecipe = JSON.parse(event.data)

                        switch (event.event) {
                            case "streaming":
                                setStatusMessage("Recept gevonden, even uitschrijven...")
                                onStreaming?.(generatedRecipe)
                                break
                            case "complete":
                                clearTimer()
                                setStatusMessage("Klaar!")
                                setIsCompleted(true)
                                onComplete?.(generatedRecipe)
                                break
                        }
                    },
                    onclose: () => {
                        clearTimer()
                        setIsStreaming(false)
                        onClose?.()
                    },
                    onerror: (error: Error) => {
                        clearTimer()
                        setHasError(true)
                        setError(error.message || "An error occurred")
                        onError?.(error)
                    },
                })
            } catch (error) {
                clearTimer()
                setHasError(true)
                setError("Failed to generate recipe. Please try again.")
                onError?.(error)
            }
        },
        [onStreaming, onComplete, onClose, onError]
    )

    return {
        generateRecipe,
        isStreaming,
        isCompleted,
        hasError,
        error,
        statusMessage,
    }
}

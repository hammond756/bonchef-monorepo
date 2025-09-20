import { useCallback, useState } from "react"

type InputMode = "voice" | "text"

/**
 * Custom hook for managing input mode state
 * Handles switching between voice and text input modes
 */
export function useInputMode(initialMode: InputMode = "voice") {
    const [inputMode, setInputMode] = useState<InputMode>(initialMode)
    const [textInput, setTextInput] = useState("")

    const switchToTextMode = useCallback(() => {
        setInputMode("text")
    }, [])

    const switchToVoiceMode = useCallback(() => {
        setInputMode("voice")
        setTextInput("")
    }, [])

    const updateTextInput = useCallback((value: string) => {
        setTextInput(value)
    }, [])

    return {
        inputMode,
        textInput,
        switchToTextMode,
        switchToVoiceMode,
        updateTextInput,
    }
}

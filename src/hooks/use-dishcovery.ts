import { useState, useCallback, useMemo } from "react"

export interface DishcoveryPhoto {
    id: string
    dataUrl: string
    file: File
}

export interface DishcoveryInput {
    type: "voice" | "text"
    content: string
    isValid: boolean
}

export interface DishcoveryState {
    photo: DishcoveryPhoto | null
    input: DishcoveryInput | null
    isProcessing: boolean
    error: string | null
}

export interface UseDishcoveryReturn {
    state: DishcoveryState
    setPhoto: (photo: DishcoveryPhoto) => void
    setInput: (input: DishcoveryInput) => void
    clearInput: () => void
    setProcessing: (processing: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
    isValid: boolean
    canProceed: boolean
}

const initialState: DishcoveryState = {
    photo: null,
    input: null,
    isProcessing: false,
    error: null,
}

/**
 * Hook for managing dishcovery state including photo, input validation, and processing status
 *
 * @returns Object containing state management functions and validation flags
 */
export function useDishcovery(): UseDishcoveryReturn {
    const [state, setState] = useState<DishcoveryState>(initialState)

    const setPhoto = useCallback((photo: DishcoveryPhoto) => {
        setState((prev) => ({
            ...prev,
            photo,
            error: null, // Clear any previous errors when photo is set
        }))
    }, [])

    const setInput = useCallback((input: DishcoveryInput) => {
        setState((prev) => ({
            ...prev,
            input,
            error: null, // Clear any previous errors when input is valid
        }))
    }, [])

    const clearInput = useCallback(() => {
        setState((prev) => ({
            ...prev,
            input: null,
        }))
    }, [])

    const setProcessing = useCallback((processing: boolean) => {
        setState((prev) => ({
            ...prev,
            isProcessing: processing,
        }))
    }, [])

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({
            ...prev,
            error,
        }))
    }, [])

    const reset = useCallback(() => {
        setState(initialState)
    }, [])

    // Validation logic: photo must be present and input must be valid
    const isValid = useMemo(
        () => Boolean(state.photo && state.input?.isValid),
        [state.photo, state.input?.isValid]
    )

    // Can proceed when valid and not currently processing
    const canProceed = useMemo(() => isValid && !state.isProcessing, [isValid, state.isProcessing])

    // Memoize the return object to prevent infinite re-renders
    const returnValue = useMemo(
        () => ({
            state,
            setPhoto,
            setInput,
            clearInput,
            setProcessing,
            setError,
            reset,
            isValid,
            canProceed,
        }),
        [state, setPhoto, setInput, clearInput, setProcessing, setError, reset, isValid, canProceed]
    )

    return returnValue
}

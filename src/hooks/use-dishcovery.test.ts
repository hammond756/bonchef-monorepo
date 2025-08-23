import { renderHook, act } from "@testing-library/react"
import { useDishcovery, type DishcoveryPhoto, type DishcoveryInput } from "./use-dishcovery"

describe("useDishcovery", () => {
    const mockPhoto: DishcoveryPhoto = {
        id: "test-photo-1",
        dataUrl: "data:image/jpeg;base64,test",
        file: new File(["test"], "test.jpg", { type: "image/jpeg" }),
    }

    const mockVoiceInput: DishcoveryInput = {
        type: "voice",
        content: "Dit is een heerlijke pasta",
        isValid: true,
    }

    const mockTextInput: DishcoveryInput = {
        type: "text",
        content: "Dit gerecht bevat tomaten en basilicum",
        isValid: true,
    }

    const mockInvalidInput: DishcoveryInput = {
        type: "text",
        content: "",
        isValid: false,
    }

    it("should initialize with default state", () => {
        const { result } = renderHook(() => useDishcovery())

        expect(result.current.state).toEqual({
            photo: null,
            input: null,
            isProcessing: false,
            error: null,
        })
        expect(result.current.isValid).toBe(false)
        expect(result.current.canProceed).toBe(false)
    })

    it("should set photo correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setPhoto(mockPhoto)
        })

        expect(result.current.state.photo).toEqual(mockPhoto)
        expect(result.current.state.error).toBeNull()
    })

    it("should set voice input correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setInput(mockVoiceInput)
        })

        expect(result.current.state.input).toEqual(mockVoiceInput)
        expect(result.current.state.error).toBeNull()
    })

    it("should set text input correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setInput(mockTextInput)
        })

        expect(result.current.state.input).toEqual(mockTextInput)
        expect(result.current.state.error).toBeNull()
    })

    it("should clear input correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setInput(mockVoiceInput)
        })

        expect(result.current.state.input).toEqual(mockVoiceInput)

        act(() => {
            result.current.clearInput()
        })

        expect(result.current.state.input).toBeNull()
    })

    it("should set processing state correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setProcessing(true)
        })

        expect(result.current.state.isProcessing).toBe(true)

        act(() => {
            result.current.setProcessing(false)
        })

        expect(result.current.state.isProcessing).toBe(false)
    })

    it("should set error correctly", () => {
        const { result } = renderHook(() => useDishcovery())
        const errorMessage = "Something went wrong"

        act(() => {
            result.current.setError(errorMessage)
        })

        expect(result.current.state.error).toBe(errorMessage)

        act(() => {
            result.current.setError(null)
        })

        expect(result.current.state.error).toBeNull()
    })

    it("should reset state correctly", () => {
        const { result } = renderHook(() => useDishcovery())

        // Set some state
        act(() => {
            result.current.setPhoto(mockPhoto)
            result.current.setInput(mockVoiceInput)
            result.current.setProcessing(true)
            result.current.setError("Test error")
        })

        // Reset
        act(() => {
            result.current.reset()
        })

        expect(result.current.state).toEqual({
            photo: null,
            input: null,
            isProcessing: false,
            error: null,
        })
    })

    it("should validate correctly with photo and valid input", () => {
        const { result } = renderHook(() => useDishcovery())

        // Only photo - not valid
        act(() => {
            result.current.setPhoto(mockPhoto)
        })
        expect(result.current.isValid).toBe(false)
        expect(result.current.canProceed).toBe(false)

        // Photo + valid input - valid
        act(() => {
            result.current.setInput(mockVoiceInput)
        })
        expect(result.current.isValid).toBe(true)
        expect(result.current.canProceed).toBe(true)
    })

    it("should not be valid with photo and invalid input", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setPhoto(mockPhoto)
            result.current.setInput(mockInvalidInput)
        })

        expect(result.current.isValid).toBe(false)
        expect(result.current.canProceed).toBe(false)
    })

    it("should not allow proceeding when processing", () => {
        const { result } = renderHook(() => useDishcovery())

        // Set valid state
        act(() => {
            result.current.setPhoto(mockPhoto)
            result.current.setInput(mockVoiceInput)
        })
        expect(result.current.canProceed).toBe(true)

        // Start processing
        act(() => {
            result.current.setProcessing(true)
        })
        expect(result.current.isValid).toBe(true)
        expect(result.current.canProceed).toBe(false)
    })

    it("should clear error when setting photo", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setError("Test error")
        })
        expect(result.current.state.error).toBe("Test error")

        act(() => {
            result.current.setPhoto(mockPhoto)
        })
        expect(result.current.state.error).toBeNull()
    })

    it("should clear error when setting valid input", () => {
        const { result } = renderHook(() => useDishcovery())

        act(() => {
            result.current.setError("Test error")
        })
        expect(result.current.state.error).toBe("Test error")

        act(() => {
            result.current.setInput(mockVoiceInput)
        })
        expect(result.current.state.error).toBeNull()
    })
})

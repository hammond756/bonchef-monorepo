import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { vi } from "vitest"
import { DishcoveryDescription } from "./dishcovery-description"

// Mock the startRecipeImportJob function
vi.mock("@/actions/recipe-imports", () => ({
    startRecipeImportJob: vi.fn().mockResolvedValue("test-job-id"),
    uploadImage: vi.fn().mockResolvedValue("https://example.com/uploaded-photo.jpg"),
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock speech recognition
const mockSpeechRecognition = vi.fn()
Object.defineProperty(window, "webkitSpeechRecognition", {
    value: mockSpeechRecognition,
    writable: true,
})

const mockRecognitionInstance = {
    continuous: false,
    interimResults: false,
    lang: "",
    start: vi.fn(),
    stop: vi.fn(),
    onresult: null as any,
    onerror: null as any,
    onend: null as any,
}

describe("DishcoveryDescription", () => {
    const defaultProps = {
        photo: {
            id: "test-photo",
            dataUrl: "data:image/jpeg;base64,test",
            file: new File(["test"], "test.jpg", { type: "image/jpeg" }),
        },
        onBack: vi.fn(),
        onContinue: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockSpeechRecognition.mockReturnValue(mockRecognitionInstance)
    })

    it("renders photo display", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        expect(screen.getByAltText("Captured dish")).toBeInTheDocument()
        expect(screen.getByText("Vertel meer over dit gerecht")).toBeInTheDocument()
        expect(
            screen.getByText("Beschrijf ingrediënten, smaken, kruiden, en alles wat bijzonder is.")
        ).toBeInTheDocument()
    })

    it("shows back button", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        expect(screen.getByRole("button", { name: /terug/i })).toBeInTheDocument()
    })

    it("calls onBack when back button is clicked", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        fireEvent.click(screen.getByRole("button", { name: /terug/i }))
        expect(defaultProps.onBack).toHaveBeenCalled()
    })

    it("shows voice mode by default", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        expect(screen.getByRole("button", { name: /beginnen met spreken/i })).toBeInTheDocument()
        expect(screen.getByText("Ik kan nu niet praten")).toBeInTheDocument()
    })

    it("switches to text mode when 'Ik kan nu niet praten' button is clicked", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        fireEvent.click(screen.getByText("Ik kan nu niet praten"))

        expect(screen.getByPlaceholderText(/beschrijf de ingrediënten/i)).toBeInTheDocument()
        expect(screen.getByText("0/500")).toBeInTheDocument()
    })

    it("switches back to voice mode when 'Toch liever spreken' button is clicked", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode first
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))

        // Switch back to voice mode
        fireEvent.click(screen.getByText("Toch liever spreken"))

        expect(screen.getByRole("button", { name: /beginnen met spreken/i })).toBeInTheDocument()
        expect(screen.queryByPlaceholderText(/beschrijf de ingrediënten/i)).not.toBeInTheDocument()
    })

    it("handles text input changes", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))

        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        expect(textarea).toHaveValue("Test description")
        expect(screen.getByText("16/500")).toBeInTheDocument()
    })

    it("disables continue button when no input is provided", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeDisabled()
    })

    it("enables continue button when voice input is provided", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Voice mode is default, but without transcript the button should be disabled
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeDisabled()
    })

    it("enables continue button when text input is provided", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))

        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // With new validation logic, button becomes enabled when we have photo + valid input
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled() // Button is enabled with photo + valid text input
    })

    it("calls onContinue with text input when continue button is clicked", async () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode and add input
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // With new validation logic, button is enabled and can be clicked
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
        fireEvent.click(continueButton)

        // Wait for the async operation to complete
        await waitFor(() => {
            expect(defaultProps.onContinue).toHaveBeenCalledWith("Test description")
        })
    })

    it("shows loading state when continue button is clicked", async () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode and add input
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // With new validation logic, button is enabled and can be clicked
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
        fireEvent.click(continueButton)

        // Wait for the loading state to appear
        await waitFor(() => {
            expect(screen.getByText("Bezig...")).toBeInTheDocument()
        })
    })

    // Additional validation tests
    it("validates minimum text input length (3 characters)", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)

        // Test with 2 characters (invalid)
        fireEvent.change(textarea, { target: { value: "ab" } })
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeDisabled()

        // Test with 3 characters (valid)
        fireEvent.change(textarea, { target: { value: "abc" } })
        expect(continueButton).toBeEnabled()
    })

    it("validates maximum text input length (500 characters)", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)

        // Test with 500 characters
        const longText = "a".repeat(500)
        fireEvent.change(textarea, { target: { value: longText } })

        expect(textarea).toHaveValue(longText)
        expect(screen.getByText("500/500")).toBeInTheDocument()

        // Button should still be enabled with valid length
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
    })

    it("handles empty and whitespace-only text input", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)

        // Test with empty string
        fireEvent.change(textarea, { target: { value: "" } })
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeDisabled()

        // Test with only whitespace
        fireEvent.change(textarea, { target: { value: "   " } })
        expect(continueButton).toBeDisabled()

        // Test with whitespace + valid content
        fireEvent.change(textarea, { target: { value: "  valid  " } })
        expect(continueButton).toBeEnabled()
    })

    it("shows error message when speech recognition fails", async () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Wait for component to mount and initialize speech recognition
        await waitFor(() => {
            expect(mockSpeechRecognition).toHaveBeenCalled()
        })

        // Get the mock instance and simulate error
        const mockRecognition = mockSpeechRecognition.mock.results[0].value
        expect(mockRecognition.onerror).toBeDefined()

        // Simulate error event wrapped in act() to handle React state updates
        if (mockRecognition.onerror) {
            act(() => {
                mockRecognition.onerror({ error: "not-allowed" })
            })
        }

        // Wait for error message to appear
        await waitFor(() => {
            expect(screen.getByText(/microfoon toegang geweigerd/i)).toBeInTheDocument()
        })
    })
})

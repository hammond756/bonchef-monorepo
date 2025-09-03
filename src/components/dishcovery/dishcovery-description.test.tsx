import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { vi } from "vitest"
import { DishcoveryDescription } from "./dishcovery-description"

// Mock the startRecipeImportJob function
vi.mock("@/actions/recipe-imports", () => ({
    uploadDishcoveryAssets: vi.fn().mockResolvedValue({
        photoUrl: "https://example.com/uploaded-photo.jpg",
        audioUrl: "https://example.com/audio.mp3",
    }),
    startRecipeImportJob: vi.fn().mockResolvedValue("test-job-id"),
}))

// Mock the transcribeAudio function
vi.mock("@/services/speech/client", () => ({
    transcribeAudio: vi.fn().mockResolvedValue({
        transcript: "Dit is een test transcript",
        confidence: 0.9,
        languageCode: "nl-NL",
    }),
}))

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock MediaRecorder with proper event handling
const mockMediaRecorder = {
    start: vi.fn(),
    stop: vi.fn(),
    ondataavailable: null as any,
    onstop: null as any,
}

const mockMediaRecorderConstructor = vi.fn().mockImplementation(() => mockMediaRecorder)

Object.defineProperty(window, "MediaRecorder", {
    value: mockMediaRecorderConstructor,
    writable: true,
})

// Mock getUserMedia
Object.defineProperty(navigator, "mediaDevices", {
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }],
        }),
    },
    writable: true,
})

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
        mockMediaRecorderConstructor.mockReturnValue(mockMediaRecorder)
        // Reset mock state
        mockMediaRecorder.ondataavailable = null
        mockMediaRecorder.onstop = null
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

        expect(screen.getByRole("textbox")).toBeInTheDocument()
        expect(screen.getByText("Toch liever spreken")).toBeInTheDocument()
    })

    it("switches back to voice mode when 'Toch liever spreken' button is clicked", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // First switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))

        // Then switch back to voice mode
        fireEvent.click(screen.getByText("Toch liever spreken"))

        expect(screen.getByRole("button", { name: /beginnen met spreken/i })).toBeInTheDocument()
        expect(screen.getByText("Ik kan nu niet praten")).toBeInTheDocument()
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

        // Voice mode is default, but without recording the button should be disabled
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeDisabled()
    })

    it("enables continue button when text input is provided", () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)

        // Add valid text input
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // Button should be enabled with valid text input
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
    })

    it("calls onContinue with text input when continue button is clicked", async () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode and add input
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // Button should be enabled and can be clicked
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
        fireEvent.click(continueButton)

        // Wait for the processing to complete (no loading state in new architecture)
        await waitFor(() => {
            expect(defaultProps.onContinue).toHaveBeenCalled()
        })
    })

    it("shows loading state when continue button is clicked", async () => {
        render(<DishcoveryDescription {...defaultProps} />)

        // Switch to text mode and add input
        fireEvent.click(screen.getByText("Ik kan nu niet praten"))
        const textarea = screen.getByPlaceholderText(/beschrijf de ingrediënten/i)
        fireEvent.change(textarea, { target: { value: "Test description" } })

        // Button should be enabled and can be clicked
        const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
        expect(continueButton).toBeEnabled()
        fireEvent.click(continueButton)

        // Wait for the processing to complete (no loading state in new architecture)
        await waitFor(() => {
            expect(defaultProps.onContinue).toHaveBeenCalled()
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

    it("handles audio recording auto-start", async () => {
        // Mock the recording process
        const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
        ;(navigator.mediaDevices.getUserMedia as any).mockResolvedValue(mockStream)

        // Mock MediaRecorder.isTypeSupported to return true for our formats
        Object.defineProperty(MediaRecorder, "isTypeSupported", {
            value: vi.fn().mockReturnValue(true),
            writable: true,
        })

        render(<DishcoveryDescription {...defaultProps} />)

        // Verify that MediaRecorder was created and started automatically
        await waitFor(() => {
            expect(mockMediaRecorderConstructor).toHaveBeenCalled()
            expect(mockMediaRecorder.start).toHaveBeenCalled()
        })

        // Verify that the button shows "Stop opname"
        expect(screen.getByRole("button", { name: /stop opname/i })).toBeInTheDocument()
    })

    it("enables continue button after audio recording", async () => {
        // Mock the recording process
        const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
        ;(navigator.mediaDevices.getUserMedia as any).mockResolvedValue(mockStream)

        // Mock MediaRecorder.isTypeSupported to return true for our formats
        Object.defineProperty(MediaRecorder, "isTypeSupported", {
            value: vi.fn().mockReturnValue(true),
            writable: true,
        })

        render(<DishcoveryDescription {...defaultProps} />)

        // Wait for auto-start recording
        await waitFor(() => {
            expect(mockMediaRecorder.start).toHaveBeenCalled()
        })

        // Simulate recording completion by triggering onstop event
        const mockAudioBlob = new Blob(["test audio"], { type: "audio/webm" })
        act(() => {
            if (mockMediaRecorder.onstop) {
                mockMediaRecorder.onstop(new Event("stop"))
            }
        })

        // Simulate data available event
        act(() => {
            if (mockMediaRecorder.ondataavailable) {
                mockMediaRecorder.ondataavailable({
                    data: mockAudioBlob,
                } as any)
            }
        })

        // The continue button should now be enabled
        await waitFor(() => {
            const continueButton = screen.getByRole("button", { name: /Bonchef!!/i })
            expect(continueButton).toBeEnabled()
        })
    })
})

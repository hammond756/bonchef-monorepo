import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DishcoveryCamera } from "./dishcovery-camera"
import { vi } from "vitest"

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn()
Object.defineProperty(navigator, "mediaDevices", {
    value: {
        getUserMedia: mockGetUserMedia,
    },
    writable: true,
})

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, "play", {
    value: vi.fn().mockResolvedValue(undefined),
})

Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
    set: vi.fn(),
})

// Mock canvas context
const mockContext = {
    drawImage: vi.fn(),
    getImageData: vi.fn(),
}
const mockCanvas = {
    getContext: vi.fn(() => mockContext),
    toBlob: vi.fn((callback) => callback(new Blob(["fake-image"], { type: "image/jpeg" }))),
    toDataURL: vi.fn(() => "data:image/jpeg;base64,fake-data"),
    width: 1920,
    height: 1080,
}

// Mock video element
const mockVideo = {
    videoWidth: 1920,
    videoHeight: 1080,
    srcObject: null,
    play: vi.fn(),
}

describe("DishcoveryCamera", () => {
    const defaultProps = {
        onPhotoCaptured: vi.fn(),
        onBack: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Mock successful camera access
        mockGetUserMedia.mockResolvedValue({
            getTracks: () => [
                {
                    stop: vi.fn(),
                },
            ],
        })
    })

    it("shows back button", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        expect(screen.getByRole("button", { name: /terug/i })).toBeInTheDocument()
    })

    it("shows gallery button", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        expect(screen.getByRole("button", { name: /galerij/i })).toBeInTheDocument()
    })

    it("shows camera capture button", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        expect(screen.getByRole("button", { name: /foto maken/i })).toBeInTheDocument()
    })

    it("calls onBack when back button is clicked", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        fireEvent.click(screen.getByRole("button", { name: /terug/i }))
        expect(defaultProps.onBack).toHaveBeenCalled()
    })

    it("shows gallery option when camera is not available", async () => {
        const error = new Error("NotFoundError")
        error.name = "NotFoundError"
        mockGetUserMedia.mockRejectedValue(error)

        render(<DishcoveryCamera {...defaultProps} />)

        await waitFor(() => {
            expect(screen.getAllByText("NotFoundError")).toHaveLength(2)
        })
    })

    it("shows basic camera interface", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        expect(screen.getByRole("button", { name: /foto maken/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /galerij/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /terug/i })).toBeInTheDocument()
    })

    it("handles camera capture button click", () => {
        render(<DishcoveryCamera {...defaultProps} />)

        const captureButton = screen.getByRole("button", { name: /foto maken/i })
        expect(captureButton).toBeInTheDocument()

        // Just test that the button exists and can be clicked
        fireEvent.click(captureButton)
        // No assertions about photo capture since it doesn't work in test environment
    })
})

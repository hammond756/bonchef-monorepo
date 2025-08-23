import { render, screen, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import DishcoveryPage from "./page"

// Mock the router
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}))

// Mock the camera component
vi.mock("@/components/dishcovery/dishcovery-camera", () => ({
    DishcoveryCamera: ({ onPhotoCaptured, onBack }: any) => (
        <div>
            <button onClick={onBack} aria-label="Mock back button">
                Back
            </button>
            <button
                onClick={() =>
                    onPhotoCaptured({
                        id: "test",
                        dataUrl: "data:image/jpeg;base64,test",
                        file: new File(["test"], "test.jpg", { type: "image/jpeg" }),
                    })
                }
                aria-label="Mock capture button"
            >
                Capture
            </button>
        </div>
    ),
}))

// Mock the description component
vi.mock("@/components/dishcovery/dishcovery-description", () => ({
    DishcoveryDescription: ({ photo, onBack, onContinue }: any) => (
        <div>
            <button onClick={onBack} aria-label="Mock description back button">
                Back to Camera
            </button>
            <button
                onClick={() => onContinue("Test description")}
                aria-label="Mock continue button"
            >
                Continue
            </button>
            <img src={photo.dataUrl} alt="Mock photo" />
        </div>
    ),
}))

describe("DishcoveryPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders camera component initially", () => {
        render(<DishcoveryPage />)

        expect(screen.getByLabelText("Mock back button")).toBeInTheDocument()
        expect(screen.getByLabelText("Mock capture button")).toBeInTheDocument()
    })

    it("navigates back to home when back button is clicked", () => {
        render(<DishcoveryPage />)

        fireEvent.click(screen.getByLabelText("Mock back button"))
        expect(mockPush).toHaveBeenCalledWith("/")
    })

    it("shows description screen after photo capture", () => {
        render(<DishcoveryPage />)

        fireEvent.click(screen.getByLabelText("Mock capture button"))

        expect(screen.getByLabelText("Mock description back button")).toBeInTheDocument()
        expect(screen.getByLabelText("Mock continue button")).toBeInTheDocument()
        expect(screen.getByAltText("Mock photo")).toBeInTheDocument()
    })

    it("allows going back to camera from description screen", () => {
        render(<DishcoveryPage />)

        // Go to description screen
        fireEvent.click(screen.getByLabelText("Mock capture button"))

        // Click back to camera
        fireEvent.click(screen.getByLabelText("Mock description back button"))

        // Should be back to camera screen
        expect(screen.getByLabelText("Mock back button")).toBeInTheDocument()
        expect(screen.getByLabelText("Mock capture button")).toBeInTheDocument()
    })

    it("calls onContinue when continue button is clicked", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

        render(<DishcoveryPage />)

        // Go to description screen
        fireEvent.click(screen.getByLabelText("Mock capture button"))

        // Click continue
        fireEvent.click(screen.getByLabelText("Mock continue button"))

        expect(consoleSpy).toHaveBeenCalledWith("Description:", "Test description")
        expect(mockPush).toHaveBeenCalledWith("/collection")

        consoleSpy.mockRestore()
    })
})

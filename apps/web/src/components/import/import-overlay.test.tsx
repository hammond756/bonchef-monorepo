import { render, screen, fireEvent } from "@testing-library/react"
import { ImportOverlay } from "./import-overlay"
import { vi } from "vitest"

// Mock Next.js router
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}))

describe("ImportOverlay", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSelectMode: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders all import modes", () => {
        render(<ImportOverlay {...defaultProps} />)

        expect(screen.getByText("Scan")).toBeInTheDocument()
        expect(screen.getByText("Website")).toBeInTheDocument()
        expect(screen.getByText("Notitie")).toBeInTheDocument()
        expect(screen.getByText("Dishcovery")).toBeInTheDocument()
    })

    it("calls onSelectMode when photo mode is clicked", () => {
        render(<ImportOverlay {...defaultProps} />)

        fireEvent.click(screen.getByText("Scan"))
        expect(defaultProps.onSelectMode).toHaveBeenCalledWith("photo")
    })

    it("calls onSelectMode when url mode is clicked", () => {
        render(<ImportOverlay {...defaultProps} />)

        fireEvent.click(screen.getByText("Website"))
        expect(defaultProps.onSelectMode).toHaveBeenCalledWith("url")
    })

    it("calls onSelectMode when text mode is clicked", () => {
        render(<ImportOverlay {...defaultProps} />)

        fireEvent.click(screen.getByText("Notitie"))
        expect(defaultProps.onSelectMode).toHaveBeenCalledWith("text")
    })

    it("navigates to dishcovery page when Dishcovery button is clicked", () => {
        render(<ImportOverlay {...defaultProps} />)

        fireEvent.click(screen.getByText("Dishcovery"))
        expect(defaultProps.onClose).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith("/dishcovery")
    })

    it("calls onClose when close button is clicked", () => {
        render(<ImportOverlay {...defaultProps} />)

        fireEvent.click(screen.getByLabelText("Sluiten"))
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it("displays correct title", () => {
        render(<ImportOverlay {...defaultProps} />)

        expect(screen.getByText("Recept importeren")).toBeInTheDocument()
    })

    it("shows separator text", () => {
        render(<ImportOverlay {...defaultProps} />)

        expect(screen.getByText("of")).toBeInTheDocument()
    })
})

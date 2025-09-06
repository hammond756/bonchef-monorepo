import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import { ChatInput } from "@/components/chat-input"

// Mock child components that are not the focus of this test suite.
vi.mock("@/components/url-status-list", () => ({
    UrlStatusList: () => <div data-testid="url-status-list" />,
}))

// Mocking createObjectURL for the useFileUpload hook to work in a JSDOM environment
beforeEach(() => {
    // Return a valid data URL to satisfy the next/image component
    window.URL.createObjectURL = vi.fn(
        () =>
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    )
    window.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
    vi.mocked(window.URL.createObjectURL).mockClear()
    vi.mocked(window.URL.revokeObjectURL).mockClear()
})

describe("ChatInput", () => {
    let onSend: () => void
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        onSend = vi.fn()
        user = userEvent.setup()
        // Mock all fetch calls to prevent real network requests.
        // Specific tests can override this default mock.
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ url: "mock-image-url" }),
            })
        ) as any
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it("renders the chat input, image upload button, and send button", () => {
        render(<ChatInput onSend={onSend} isLoading={false} />)
        expect(screen.getByTestId("chat-input")).toBeInTheDocument()
        expect(screen.getByTestId("image-upload-button")).toBeInTheDocument()
        expect(screen.getByTestId("send-button")).toBeInTheDocument()
    })

    it("calls onSend when the send button is clicked with a message", async () => {
        render(<ChatInput onSend={onSend} isLoading={false} />)
        const input = screen.getByTestId("chat-input")
        await user.type(input, "Hello, world!")
        await user.click(screen.getByTestId("send-button"))
        expect(onSend).toHaveBeenCalled()
    })

    it("calls onSend when Enter is pressed in the textarea", async () => {
        render(<ChatInput onSend={onSend} isLoading={false} />)
        const input = screen.getByTestId("chat-input")
        await user.type(input, "Hello, world!{enter}")
        expect(onSend).toHaveBeenCalled()
    })

    it("disables the send button when isLoading is true", () => {
        render(<ChatInput onSend={onSend} isLoading={true} />)
        expect(screen.getByTestId("send-button")).toBeDisabled()
    })

    it("disables the send button while a URL is being fetched", async () => {
        let resolveFetch: (value: unknown) => void
        const fetchPromise = new Promise((resolve) => {
            resolveFetch = resolve
        })
        global.fetch = vi.fn(() => fetchPromise) as any

        render(<ChatInput onSend={onSend} isLoading={false} />)
        const input = screen.getByTestId("chat-input")
        await user.type(input, "http://example.com")

        // The button should be disabled immediately after typing the URL
        await waitFor(() => {
            expect(screen.getByTestId("send-button")).toBeDisabled()
        })

        // Resolve the fetch and check if the button becomes enabled again
        resolveFetch!({ ok: true, json: () => Promise.resolve({ content: "data" }) })
        await waitFor(() => {
            expect(screen.getByTestId("send-button")).not.toBeDisabled()
        })
    })

    it("shows loading spinner and disables send button during image upload", async () => {
        let resolveUpload: (value: unknown) => void
        const uploadPromise = new Promise((resolve) => {
            resolveUpload = resolve
        })
        global.fetch = vi.fn(() => uploadPromise) as any

        render(<ChatInput onSend={onSend} isLoading={false} />)
        const fileInput = screen.getByTestId("image-upload-input")
        const file = new File(["hello"], "hello.png", { type: "image/png" })
        await user.upload(fileInput, file)

        await waitFor(() => {
            expect(
                screen.getByTestId("image-upload-button").querySelector(".animate-spin")
            ).toBeInTheDocument()
            expect(screen.getByTestId("send-button")).toBeDisabled()
        })

        resolveUpload!({ ok: true, json: () => Promise.resolve({ url: "new-image-url" }) })

        await waitFor(() => {
            expect(
                screen.queryByTestId("image-upload-button")?.querySelector(".animate-spin")
            ).not.toBeInTheDocument()
            expect(screen.getByTestId("send-button")).not.toBeDisabled()
        })
    })

    it("shows image preview and remove button after successful upload", async () => {
        render(<ChatInput onSend={onSend} isLoading={false} />)
        const fileInput = screen.getByTestId("image-upload-input")
        const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })
        await user.upload(fileInput, file)

        await waitFor(() => {
            expect(screen.getByTestId("uploaded-image-preview")).toBeInTheDocument()
            expect(screen.getByTestId("remove-image-button")).toBeInTheDocument()
        })

        // Now click the remove button
        await user.click(screen.getByTestId("remove-image-button"))
        await waitFor(() => {
            expect(screen.queryByTestId("uploaded-image-preview")).not.toBeInTheDocument()
        })
    })

    it("displays an error message if image upload fails", async () => {
        global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 })) as any
        render(<ChatInput onSend={onSend} isLoading={false} />)
        const fileInput = screen.getByTestId("image-upload-input")
        const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })
        await user.upload(fileInput, file)

        await waitFor(() => {
            expect(
                screen.getByText("Failed to upload image. Please try again.")
            ).toBeInTheDocument()
        })
    })

    it("triggers the file input when the image upload button is clicked", async () => {
        render(<ChatInput onSend={onSend} isLoading={false} />)
        const uploadButton = screen.getByTestId("image-upload-button")
        const fileInput = screen.getByTestId("image-upload-input")
        const fileInputClickSpy = vi.spyOn(fileInput, "click")

        await user.click(uploadButton)

        expect(fileInputClickSpy).toHaveBeenCalled()
        fileInputClickSpy.mockRestore()
    })
})

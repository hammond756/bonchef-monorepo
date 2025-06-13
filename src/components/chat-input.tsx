"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from "react"
import { Button } from "./ui/button"
import { UrlStatusList } from "./url-status-list"
import { SendIcon, ImageIcon, X, Loader2 } from "lucide-react"
import AutoGrowingTextarea from "./ui/auto-growing-textarea"
import { UserInput, ImageData } from "@/lib/types"
import { useJiggleAnimation } from "@/hooks/useJiggleAnimation"
import Image from "next/image"
import { useFileUpload } from "@/hooks/use-file-upload"

interface ChatInputProps {
    onSend: (userInput: UserInput) => void
    isLoading: boolean
    isExpanded?: boolean
    placeholder?: string
}

interface UrlStatus {
    url: string
    status: "loading" | "success" | "error"
    content?: string
}

function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || []
}

async function fetchUrlContent(url: string): Promise<string> {
    const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    })

    if (!response.ok) {
        throw new Error("Failed to fetch URL content")
    }

    const data = await response.json()
    return data.content
}

// Convert plain URLs to markdown links
function convertUrlsToMarkdown(text: string): string {
    return text.replace(/(https?:\/\/[^\s]+)/g, (url) => `[${url}](${url})`)
}

async function uploadImageToChat(file: File) {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("isPublic", "false")

    const response = await fetch("/api/upload-image/chat-images", {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        console.error("Failed to upload image", response)
        throw new Error("Failed to upload image")
    }

    const data = await response.json()

    return {
        url: data.url,
        type: file.type as ImageData["type"],
        size: file.size,
    }
}

export interface ChatInputHandle {
    focus: () => void
}

// Is exported at the bottom of the file with forwardRef to allow for ref forwarding
// TODO: figure out if this is still needed
const ChatInputBase = (
    {
        onSend,
        isLoading,
        isExpanded = false,
        placeholder = "Typ hier je bericht...",
    }: ChatInputProps,
    ref: React.Ref<ChatInputHandle>
) => {
    const [message, setMessage] = useState("")
    const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([])
    const [imageData, setImageData] = useState<ImageData | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { shouldJiggle, triggerJiggle } = useJiggleAnimation()

    // Use useFileUpload for image upload state
    const {
        preview,
        file,
        fileInputRef,
        handleChange: handleFileChange,
        handleRemove: handleRemoveImage,
        reset: resetFileUpload,
    } = useFileUpload({ initialFilePath: null })

    useImperativeHandle(ref, () => ({
        focus: () => {
            textareaRef.current?.focus()
        },
    }))

    const updateUrlStatus = useCallback((url: string, newStatus: Partial<UrlStatus>) => {
        setUrlStatuses((prev) =>
            prev.map((status) => (status.url === url ? { ...status, ...newStatus } : status))
        )
    }, [])

    const handleUrlFetch = useCallback(
        async (url: string) => {
            try {
                const content = await fetchUrlContent(url)
                updateUrlStatus(url, { status: "success", content })
            } catch {
                updateUrlStatus(url, { status: "error" })
            }
        },
        [updateUrlStatus]
    )

    useEffect(() => {
        const newUrls = extractUrls(message)

        setUrlStatuses((prevStatuses) => {
            const prevUrls = new Set(prevStatuses.map((s) => s.url))

            // Keep statuses for URLs that are still in the message
            const statusesToKeep = prevStatuses.filter((s) => newUrls.includes(s.url))

            // Identify new URLs to fetch
            const urlsToFetch = newUrls.filter((url) => !prevUrls.has(url))

            // If no new URLs to fetch and no URLs removed, do nothing to prevent re-renders.
            if (urlsToFetch.length === 0 && statusesToKeep.length === prevStatuses.length) {
                return prevStatuses
            }

            // For new URLs, trigger fetch and add to statuses with 'loading' state
            urlsToFetch.forEach(handleUrlFetch)

            const newStatuses = urlsToFetch.map((url) => ({ url, status: "loading" as const }))

            return [...statusesToKeep, ...newStatuses]
        })
    }, [message, handleUrlFetch])

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = handleFileChange(e)

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/heic"]
        if (selectedFile && !validTypes.includes(selectedFile.type)) {
            console.log("invalid file type", selectedFile.type)
            setError("Please upload a JPG, PNG, or HEIC image")
            handleRemoveImage()
            return
        }

        // Validate file size (max 5MB)
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            console.log("invalid file size", selectedFile.size)
            setError("Image size must be less than 5MB")
            handleRemoveImage()
            return
        }

        console.log("selectedFile", selectedFile)

        if (!selectedFile) {
            setError("Please upload an image")
            return
        }

        try {
            setIsUploading(true)
            const imageData = await uploadImageToChat(selectedFile)
            setImageData(imageData)
        } catch (error) {
            console.error("Error uploading image", error)
            setError("Failed to upload image. Please try again. Error: " + error)
        } finally {
            setIsUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!message.trim() && !file) return

        const isUrlsLoading = urlStatuses.some((s) => s.status === "loading")
        if (isUrlsLoading) {
            triggerJiggle()
            return
        }

        const webContent = urlStatuses
            .filter((status) => status.status === "success")
            .map((status) => ({ url: status.url, content: status.content! }))

        // Convert URLs to markdown links before sending
        const messageWithMarkdownLinks = convertUrlsToMarkdown(message)

        onSend({
            message: messageWithMarkdownLinks,
            webContent,
            image: imageData || undefined,
        })
        setMessage("")
        setUrlStatuses([])
        resetFileUpload()
    }

    function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setMessage(e.target.value)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border-t bg-white p-4">
            <UrlStatusList urls={urlStatuses} className={shouldJiggle ? "animate-jiggle" : ""} />
            {preview && (
                <div className="relative mb-2 w-full max-w-[200px]">
                    <Image
                        src={preview}
                        alt="Uploaded image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                        data-testid="uploaded-image-preview"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-xs"
                        onClick={handleRemoveImage}
                        data-testid="chat-message-remove-image-button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {error && <div className="mb-2 text-red-500">{error}</div>}
            <div className="flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/heic"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="image-upload-input"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="h-[40px] w-[40px] self-end"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="h-4 w-4" />
                    )}
                </Button>
                <AutoGrowingTextarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    placeholder={placeholder}
                    disabled={isLoading}
                    data-testid="chat-input"
                    className={`resize-none overflow-hidden px-3 py-1.5 leading-tight transition-all duration-200 ${
                        isExpanded ? "max-h-[144px] min-h-[144px]" : "max-h-[144px] min-h-[36px]"
                    }`}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    type="submit"
                    disabled={
                        isLoading || urlStatuses.some((s) => s.status === "loading") || isUploading
                    }
                    data-testid="send-button"
                    className="h-[40px] self-end px-3"
                >
                    <SendIcon className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(ChatInputBase)

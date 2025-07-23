"use client"

import { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from "react"
import { UserInput, ImageData, WebContent } from "@/lib/types"
import { useJiggleAnimation } from "@/hooks/useJiggleAnimation"
import { useFileUpload } from "@/hooks/use-file-upload"

interface UseChatInputProps {
    onSend: (userInput: UserInput) => void
    isLoading: boolean
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

export function useChatInput({ onSend, isLoading }: UseChatInputProps) {
    const [message, setMessage] = useState("")
    const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([])
    const [imageData, setImageData] = useState<ImageData | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")
    const { shouldJiggle, triggerJiggle } = useJiggleAnimation()
    const {
        preview,
        file,
        fileInputRef,
        handleChange: handleFileChange,
        handleRemove: removeImage,
        reset: resetFileUpload,
    } = useFileUpload({ initialFilePath: null })

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
            const statusesToKeep = prevStatuses.filter((s) => newUrls.includes(s.url))
            const urlsToFetch = newUrls.filter((url) => !prevUrls.has(url))

            if (urlsToFetch.length === 0 && statusesToKeep.length === prevStatuses.length) {
                return prevStatuses
            }

            urlsToFetch.forEach(handleUrlFetch)
            const newStatuses = urlsToFetch.map((url) => ({ url, status: "loading" as const }))
            return [...statusesToKeep, ...newStatuses]
        })
    }, [message, handleUrlFetch])

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = handleFileChange(e)
        setError("")
        setImageData(null)

        const validTypes = ["image/jpeg", "image/png", "image/heic"]
        if (selectedFile && !validTypes.includes(selectedFile.type)) {
            setError("Please upload a JPG, PNG, or HEIC image")
            removeImage()
            return
        }

        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB")
            removeImage()
            return
        }

        if (!selectedFile) return

        try {
            setIsUploading(true)
            const uploadedImageData = await uploadImageToChat(selectedFile)
            setImageData(uploadedImageData)
        } catch (uploadError) {
            setError("Failed to upload image. Please try again.")
            console.error("Error uploading image", uploadError)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveImage = () => {
        removeImage()
        setImageData(null)
        setError("")
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if ((!message.trim() && !file) || isLoading) return

        const isUrlsLoading = urlStatuses.some((s) => s.status === "loading")
        if (isUrlsLoading) {
            triggerJiggle()
            return
        }

        const webContent: WebContent[] = urlStatuses
            .filter((status) => status.status === "success" && status.content)
            .map((status) => ({ url: status.url, content: status.content! }))

        const messageWithMarkdownLinks = convertUrlsToMarkdown(message)

        onSend({
            message: messageWithMarkdownLinks,
            webContent,
            image: imageData || undefined,
        })

        setMessage("")
        setUrlStatuses([])
        resetFileUpload()
        setImageData(null)
        setError("")
    }

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as FormEvent)
        }
    }

    return {
        message,
        urlStatuses,
        preview,
        isUploading,
        error,
        shouldJiggle,
        fileInputRef,
        handleTextareaChange,
        handleImageUpload,
        handleRemoveImage,
        handleSubmit,
        handleKeyDown,
    }
}

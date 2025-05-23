"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"
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

function autoResizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto"
  element.style.height = `${element.scrollHeight}px`
}

// Convert plain URLs to markdown links
function convertUrlsToMarkdown(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s]+)/g, 
    (url) => `[${url}](${url})`
  )
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
    size: file.size
  }
}

export interface ChatInputHandle {
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({ 
  onSend, 
  isLoading, 
  isExpanded = false,
  placeholder = "Typ hier je bericht..."
}, ref) => {
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
    }
  }))

  useEffect(() => {
    const newUrls = extractUrls(message)
    
    // Remove URLs that are no longer in the message
    setUrlStatuses(prev => prev.filter(status => 
      newUrls.includes(status.url)
    ))
    
    // Add new URLs
    newUrls.forEach(url => {
      if (!urlStatuses.some(status => status.url === url)) {
        setUrlStatuses(prev => [...prev, { url, status: "loading" }])
        
        fetchUrlContent(url)
          .then(content => {
            setUrlStatuses(prev => prev.map(status =>
              status.url === url 
                ? { ...status, status: "success", content }
                : status
            ))
          })
          .catch(() => {
            setUrlStatuses(prev => prev.map(status =>
              status.url === url 
                ? { ...status, status: "error" }
                : status
            ))
          })
      }
    })
  }, [message])

  useEffect(() => {
    // Resize textarea when message changes
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current)
    }
  }, [message])

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
    
    const isUrlsLoading = urlStatuses.some(s => s.status === "loading")
    if (isUrlsLoading) {
      triggerJiggle()
      return
    }
    
    const webContent = urlStatuses
      .filter(status => status.status === "success")
      .map(status => ({ url: status.url, content: status.content! }))
    
    // Convert URLs to markdown links before sending
    const messageWithMarkdownLinks = convertUrlsToMarkdown(message)
  
    onSend({
      message: messageWithMarkdownLinks,
      webContent,
      image: imageData || undefined
    })
    setMessage("")
    setUrlStatuses([])
    resetFileUpload()
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    autoResizeTextarea(e.target)
    setMessage(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white"
    >
      <UrlStatusList 
        urls={urlStatuses} 
        className={shouldJiggle ? "animate-jiggle" : ""}
        />
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
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm"
            onClick={handleRemoveImage}
            data-testid="chat-message-remove-image-button"
            >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
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
          className={`resize-none py-1.5 px-3 leading-tight overflow-hidden transition-all duration-200 ${
            isExpanded ? "min-h-[144px] max-h-[144px]" : "min-h-[36px] max-h-[144px]"
          }`}
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="submit" 
          disabled={isLoading || urlStatuses.some(s => s.status === "loading") || isUploading}
          data-testid="send-button"
          className="h-[40px] px-3 self-end"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}) 

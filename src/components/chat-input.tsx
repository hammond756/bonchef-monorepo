"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Button } from "./ui/button"
import { UrlStatusList } from "./url-status-list"
import { SendIcon } from "lucide-react"
import AutoGrowingTextarea from "./ui/auto-growing-textarea"
import { UserInput } from "@/lib/types"

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    }
  }))

  useEffect(() => {
    console.log("message", message)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    
    const webContent = urlStatuses
      .filter(status => status.status === "success")
      .map(status => ({ url: status.url, content: status.content! }))
    
    // Convert URLs to markdown links before sending
    const messageWithMarkdownLinks = convertUrlsToMarkdown(message)
    
    onSend({
      message: messageWithMarkdownLinks,
      webContent
    })
    setMessage("")
    setUrlStatuses([])
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    autoResizeTextarea(e.target)
    setMessage(e.target.value)
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white"
    >
      <UrlStatusList urls={urlStatuses} />
      <div className="flex gap-2">
        <AutoGrowingTextarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          disabled={isLoading}
          data-testid="chat-input"
          className={`resize-none py-1.5 px-3 leading-tight overflow-hidden transition-all duration-200 ${
            isExpanded ? "min-h-[144px] max-h-[144px]" : "min-h-[36px] max-h-[36px]"
          }`}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={isLoading || urlStatuses.some(s => s.status === "loading")}
          data-testid="send-button"
          className="h-[40px] px-3 self-end"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}) 

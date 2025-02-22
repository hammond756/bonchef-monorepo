"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { UrlStatusList } from "./url-status-list"


interface ChatInputProps {
  onSend: (message: string, webContent: string[]) => void
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

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([])

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    
    const webContent = urlStatuses
      .filter(status => status.status === "success")
      .map(status => status.content!)
    
    onSend(message, webContent)
    setMessage("")
    setUrlStatuses([])
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white"
    >
      <UrlStatusList urls={urlStatuses} />
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          data-testid="chat-input"
        />
        <Button 
          type="submit" 
          disabled={isLoading || urlStatuses.some(s => s.status === "loading")}
          data-testid="send-button"
        >
          Send
        </Button>
      </div>
    </form>
  )
} 
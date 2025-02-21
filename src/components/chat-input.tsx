"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    
    onSend(message)
    setMessage("")
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white"
    >
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
          disabled={isLoading}
          data-testid="send-button"
        >
          Send
        </Button>
      </div>
    </form>
  )
} 
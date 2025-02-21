"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { sendChatMessage } from "@/app/actions/chat"

interface Message {
  id: string
  text: string
  isUser: boolean
  isLoading?: boolean
  isError?: boolean
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useState(() => uuidv4())[0]

  async function handleSendMessage(text: string) {
    setIsLoading(true)
    
    const userMessage: Message = { id: uuidv4(), text, isUser: true }
    const loadingMessage: Message = { 
      id: uuidv4(), 
      text: "", 
      isUser: false, 
      isLoading: true 
    }
    
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const result = await sendChatMessage(text, conversationId)
      
      if (result.success) {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (!lastMessage.isLoading) return prev
          
          return [
            ...prev.slice(0, -1),
            {
              id: lastMessage.id,
              text: result.output,
              isUser: false,
              isLoading: false
            }
          ]
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (!lastMessage.isLoading) return prev
        
        return [
          ...prev.slice(0, -1),
          {
            id: lastMessage.id,
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
            isLoading: false,
            isError: true
          }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRecipeSaved(url: string) {
    console.log("Recipe saved:", url)
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id}
            message={message}
            onRecipeSaved={handleRecipeSaved}
            isLoading={message.isLoading || false}
            isLastMessage={index === messages.length - 1}
          />
        ))}
      </div>
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
} 
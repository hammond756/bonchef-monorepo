"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { sendChatMessage } from "@/app/chat/actions"

interface Message {
  id: string
  text: string
  isUser: boolean
  isLoading?: boolean
  isError?: boolean
  originalUserMessage?: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useState(() => uuidv4())[0]

  async function handleRetry(messageId: string) {
    const messageToRetry = messages.find(m => m.id === messageId)
    if (!messageToRetry?.originalUserMessage) return
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLoading: true, isError: false } : msg
    ))

    try {
      const result = await sendChatMessage(
        messageToRetry.originalUserMessage, 
        conversationId,
        []
      )
      
      if (result.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? {
            id: messageId,
            text: result.output,
            isUser: false,
            isLoading: false,
            isError: false
          } : msg
        ))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to retry message:", error)
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? {
          ...msg,
          text: "Sorry, I encountered an error. Please try again.",
          isLoading: false,
          isError: true
        } : msg
      ))
    }
  }

  async function handleSendMessage(text: string, webContent: string[]) {
    setIsLoading(true)
    
    const userMessage: Message = { id: uuidv4(), text, isUser: true, originalUserMessage: text }
    const loadingMessage: Message = { 
      id: uuidv4(), 
      text: "", 
      isUser: false, 
      isLoading: true,
      originalUserMessage: text
    }
    
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const result = await sendChatMessage(text, conversationId, webContent)
      
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
            text: "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
            isUser: false,
            isLoading: false,
            isError: true,
            originalUserMessage: lastMessage.originalUserMessage
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
            onRetry={handleRetry}
          />
        ))}
      </div>
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
} 
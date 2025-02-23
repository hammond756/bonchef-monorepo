"use client"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { sendChatMessage } from "@/app/chat/actions"
import { UserInput, BotResponse, ChatMessageData as ChatMessageType, BotMessageType, UserMessageType, BotErrorMessageType, BotLoadingMessageType } from "@/lib/types"

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useState(() => uuidv4())[0]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  async function handleRetry(message: BotErrorMessageType) {

    // Replace the error message with a loading message
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, type: "bot_loading", isLoading: true } : msg
    ))

    try {
      const result = await sendChatMessage(
        message.userInputToRetry, 
        conversationId,
      )
      
      if (result.success) {
        // First remove the loading message
        setMessages(prev => prev.filter(msg => msg.id !== message.id))

        const botResponses: BotMessageType[] = result.output.map((message: BotResponse) => ({
          id: uuidv4(),
          type: "bot",
          botResponse: message
        }))

        // Replace the loading message with the actual response
        setMessages(prev => [
          ...prev,
          ...botResponses
        ])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to retry message:", error)
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? {
          ...msg,
          type: "bot_error",
          botResponse: {
            content: "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
            type: "text"
          },
          userInputToRetry: message.userInputToRetry
        } : msg
      ))
    }
  }

  async function handleSendMessage(userInput: UserInput) {
    setIsLoading(true)
        
    const userMessage: UserMessageType = {
      id: uuidv4(),
      type: "user",
      userInput
    }
    
    const loadingMessage: BotLoadingMessageType = {
      id: uuidv4(),
      type: "bot_loading",
      isLoading: true,
    }
    
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const result = await sendChatMessage(userMessage.userInput, conversationId)
      
      if (result.success) {
        setMessages(prev => {

          // Before sending the message, we first dropped a loading message.
          // This logic services to replace the loading message with the actual response.
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.type !== "bot_loading") return prev
          
          const botResponses: BotMessageType[] = result.output.map((message: BotResponse) => ({
            id: uuidv4(),
            type: "bot",
            botResponse: message
          }))
          
          return [
            ...prev.slice(0, -1),
            ...botResponses
          ]
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages(prev => {
        // Before sending the message, we first dropped a loading message.
        // This logic services to replace the loading message with the actual response.
        const lastMessage = prev[prev.length - 1]
        if (lastMessage.type !== "bot_loading") return prev
        
        return [
          ...prev.slice(0, -1),
          {
            id: lastMessage.id,
            type: "bot_error",
            botResponse: {
              id: lastMessage.id,
              content: "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
              type: "text"
            },
            userInputToRetry: userInput
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100" ref={containerRef}>
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id}
            message={message}
            onRecipeSaved={handleRecipeSaved}
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
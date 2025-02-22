"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { sendChatMessage } from "@/app/chat/actions"
import { UserInput, BotResponse, ChatMessageData as ChatMessageType, BotMessageType, UserMessageType } from "@/lib/types"

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = useState(() => uuidv4())[0]

  async function handleRetry(messageId: string) {
    const messageToRetry = messages.find(m => m.id === messageId)
    if (!messageToRetry || !messageToRetry.isUser) return
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLoading: true, isError: false } : msg
    ))

    try {
      const result = await sendChatMessage(
        messageToRetry.userInput, 
        conversationId,
      )
      
      if (result.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? {
            id: messageId,
            isUser: false,
            isLoading: false,
            isError: false,
            botResponse: {
              id: messageId,
              content: result.output
            }
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

  async function handleSendMessage(userInput: UserInput) {
    setIsLoading(true)
        
    const userMessage: UserMessageType = {
      id: uuidv4(),
      isUser: true,
      userInput
    }
    
    const loadingMessage: BotMessageType = {
      id: uuidv4(),
      isUser: false,
      isLoading: true,
      isError: false,
      botResponse: {
        id: uuidv4(),
        content: ""
      }
    }
    
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const result = await sendChatMessage(userMessage.userInput, conversationId)
      
      if (result.success) {
        setMessages(prev => {

          // Before sending the message, we first dropped a loading message.
          // This logic services to replace the loading message with the actual response.
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.isUser || !lastMessage.isLoading) return prev
          
          const botResponse: BotResponse = {
            id: lastMessage.id,
            content: result.output
          }
          
          return [
            ...prev.slice(0, -1),
            {
              id: uuidv4(),
              isUser: false,
              isLoading: false,
              isError: false,
              botResponse
            }
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
        if (lastMessage.isUser || !lastMessage.isLoading) return prev
        
        return [
          ...prev.slice(0, -1),
          {
            id: lastMessage.id,
            isUser: false,
            isLoading: false,
            isError: true,
            botResponse: {
              id: lastMessage.id,
              content: "Sorry, er is iets mis gegaan. Probeer het opnieuw."
            }
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
            isLoading={!message.isUser && message.isLoading || false}
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
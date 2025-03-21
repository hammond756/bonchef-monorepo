"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { 
  UserInput, 
  ChatMessageData, 
  BotMessageType, 
  Message,
  LLMResponse
} from "@/lib/types"
import { useChatStore } from "@/lib/store/chat-store"
import { createStreamingRequest } from "@/lib/stream-parsers"

interface UseChatApiProps {
  onError: (errorMessage: string, userInput: UserInput) => void,
}

export function useChat({
  onError,
}: UseChatApiProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const { conversationId } = useChatStore()

  const sendMessage = async (userInput: UserInput) => {
    setIsLoading(true)
    
    try {
      await processStreamingRequest(userInput)
    } catch (error) {
      console.error("Failed to send message:", error)
      onError("Sorry, er is iets mis gegaan. Probeer het opnieuw.", userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const retryMessage = async (userInput: UserInput, messageId: string) => {
    setIsLoading(true)
    
    try {
      await processStreamingRequest(userInput)
    } catch (error) {
      console.error("Failed to retry message:", error)
      onError("Sorry, er is iets mis gegaan. Probeer het opnieuw.", userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const processStreamingRequest = async (userInput: UserInput) => {
    console.log("Processing streaming request...")
    
    const requestBody = {
      userInput: userInput,
      conversationId: conversationId,
    }

    const userMessage: ChatMessageData = {
      id: uuidv4(),
      type: "user",
      userInput
    }
      
    setMessages((prev: ChatMessageData[]) => [...prev, userMessage])

    const lastMessageIdx = messages.length + 1
    
    await createStreamingRequest<LLMResponse>(
      "/api/chat",
      requestBody,
      {
        onLoading: (loading) => setIsLoading(loading),
        
        onChunkReceived: (parsedResponse, _) => {
          if (parsedResponse && parsedResponse.messages) {
            const botResponses: BotMessageType[] = parsedResponse.messages.map((msg: Message) => ({
              id: uuidv4(),
              type: "bot",
              botResponse: msg
            }))
            
            setMessages((prev: ChatMessageData[]) => [
              ...prev.slice(0, lastMessageIdx),
              ...botResponses
            ])
          }
        },
        
        onStreamComplete: (finalResponse) => {
          const botResponses: BotMessageType[] = finalResponse.messages.map((msg: Message) => ({
            id: uuidv4(),
            type: "bot",
            botResponse: msg
          }))
          
          setMessages((prev: ChatMessageData[]) => [
            ...prev.slice(0, lastMessageIdx),
            ...botResponses
          ])
        },
        
        onError: (error) => {
          console.error("Error in streaming request:", error)
          onError("Sorry, er is iets mis gegaan. Probeer het opnieuw.", userInput)
        }
      }
    )
  }

  return {
    isLoading,
    sendMessage,
    retryMessage,
    messages,
    setMessages
  }
} 
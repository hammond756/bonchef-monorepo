"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { 
  UserInput, 
  ChatMessageData, 
  BotMessageType, 
  Message,
  LLMResponse
} from "@/lib/types"
import { useChatStore } from "@/lib/store/chat-store"
import { Allow, parse } from "partial-json"

interface UseChatApiProps {
  onError: (errorMessage: string, userInput: UserInput) => void,
}

export function useChatApi({
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
    
    const requestBody = JSON.stringify({
      userInput: userInput,
      conversationId: conversationId,
    })

    const userMessage: ChatMessageData = {
        id: uuidv4(),
        type: "user",
        userInput
      }
      
    setMessages((prev: ChatMessageData[]) => [...prev, userMessage])

    const lastMessageIdx = messages.length + 1
    
    // For accumulating partial JSON chunks
    let accumulatedJson = ""
    let streamComplete = false
    
    await fetchEventSource("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // This is needed to prevent the event source from being closed when the page is not visible
      openWhenHidden: true,
      body: requestBody,
      onmessage: (message) => {
        if (message.event === "data") {
          try {
            const data = JSON.parse(message.data)
            
            if (data.event === "on_chat_model_stream") {
              setIsLoading(false)
              
              // Extract the chunk content
              if (data.data.chunk) {
                try {
                  // Get the raw chunk data
                  const chunk = data.data.chunk
                  
                  let content = ""

                  // If the chunk has content in kwargs, process it
                  // I'm not sure which configuration causes the content to be in kwargs.content
                  // or in tool_call_chunks[0].args, but it's inconsistent.
                  if (chunk.kwargs && chunk.kwargs.tool_call_chunks && chunk.kwargs.tool_call_chunks.length > 0) {
                    // Looks like output from gpt-4o with json_schema model
                    console.log("Tool call chunks:", chunk.kwargs.tool_call_chunks)
                    content = chunk.kwargs.tool_call_chunks[0].args
                  } else if (chunk.kwargs && chunk.kwargs.content) {
                    // Looks like output from gpt-4o with function_calling mode
                    content = chunk.kwargs.content
                  }

                  // Accumulate the content
                  accumulatedJson += content

                  try {
                    // Try to parse the accumulated JSON as a complete LLMResponse
                    const parsedResponse = parse(accumulatedJson, Allow.ALL) as LLMResponse
                    
                    // If we have a valid messages array
                    if (parsedResponse && parsedResponse.messages && Array.isArray(parsedResponse.messages)) {
                      const messages = parsedResponse.messages
                      
                      // Create bot responses from messages
                      const botResponses: BotMessageType[] = messages.map((msg: Message) => ({
                        id: uuidv4(),
                        type: "bot",
                        botResponse: msg
                      }))
                      
                      // Update messages using the original pattern
                      setMessages((prev: ChatMessageData[]) => [...prev.slice(0, lastMessageIdx), ...botResponses])
                    }
                  } catch (jsonError) {
                    // If we can't parse the accumulated JSON yet, it's incomplete
                    // Just continue accumulating
                    console.log("Accumulating JSON chunks...")
                  }
                } catch (error) {
                  console.error("Error processing chunk:", error)
                }
              }
            } else if (data.event === "on_llm_end" || data.event === "on_chain_end") {
              // Mark the stream as complete when we receive the end event
              streamComplete = true
              console.log("Stream completed successfully")
              
              const finalResponse = data.data.output as LLMResponse
              
              // Create bot responses from messages
              const botResponses: BotMessageType[] = finalResponse.messages.map((msg: Message) => ({
                id: uuidv4(),
                type: "bot",
                botResponse: msg
              }))
              
              setMessages((prev: ChatMessageData[]) => [...prev.slice(0, lastMessageIdx), ...botResponses])
            }
          } catch (parseError) {
            console.error("Error parsing message data:", parseError)
          }
        }
      },
      onclose: () => {
        console.log("Stream closed")
        if (!streamComplete) {
          // If the stream closed unexpectedly, we should notify the user
          console.warn("Stream closed before completion")
        }
      },
      onerror: (err) => {
        console.error("Error in event source:", err)
        throw new Error("Failed to process streaming request")
      },
    })
  }

  return {
    isLoading,
    sendMessage,
    retryMessage,
    messages,
    setMessages
  }
} 
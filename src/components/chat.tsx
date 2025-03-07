"use client"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Camera, Link, User, FileText, Globe, MessageSquare } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ChatInput, ChatInputHandle } from "./chat-input"
import { QuickActions } from "./quick-actions"
import { sendChatMessage } from "@/app/chat/actions"
import { UserInput, BotResponse, ChatMessageData as ChatMessageType, BotMessageType, UserMessageType, BotErrorMessageType, BotLoadingMessageType } from "@/lib/types"

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInputExpanded, setIsInputExpanded] = useState(false)
  const [inputPlaceholder, setInputPlaceholder] = useState("Typ hier je bericht...")
  const conversationId = useState(() => uuidv4())[0]
  const containerRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  function handleNotImplemented() {
    alert("Nog niet geimplementeerd")
  }

  function handleSurpriseAction() {
    handleSendMessage({ message: `Verras me maar!`, webContent: [{url: "https://random.com", content: `Geef drie random recepten opties. ${conversationId}`}] })
  }

  const quickActions = [
    // { 
    //   icon: Camera, 
    //   label: "Fotografeer je koelkast",
    //   onClick: handleNotImplemented
    // },
    { 
      icon: Link, 
      label: "Importeer een recept",
      onClick: () => {
        const chatInput = document.querySelector("[data-testid='chat-input']") as HTMLTextAreaElement
        if (chatInput) {
          chatInput.focus()
          setIsInputExpanded(true)
          setInputPlaceholder("Plak hier de URL van een recept in. Je mag er ook nog vragen of aanpassingen bij schrijven.")
        }
      }
    },
    // { 
    //   icon: User, 
    //   label: "Pas jouw profiel aan",
    //   onClick: handleNotImplemented
    // },
    { 
      icon: FileText, 
      label: "Beschrijf een recept",
      onClick: () => {
        const chatInput = document.querySelector("[data-testid='chat-input']") as HTMLTextAreaElement
        if (chatInput) {
          chatInput.focus()
          setIsInputExpanded(true)
          setInputPlaceholder("Schrijf hier wat je zou willen eten. Dit mag heel specifiek zijn, of breed en verkennend.")
        }
      }
    },
    // { 
    //   icon: Globe, 
    //   label: "Zoek een recept online",
    //   onClick: handleNotImplemented
    // },
    // { 
    //   icon: MessageSquare, 
    //   label: "Spreek een bericht in",
    //   onClick: handleNotImplemented
    // }
  ]

  function handleQuickPrompt(prompt: string) {
    handleSendMessage({ message: prompt, webContent: [] })
  }

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
    setIsInputExpanded(false)
    setInputPlaceholder("Typ hier je bericht...")
        
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
    }
    setIsLoading(false)
  }

  async function handleRecipeSaved(url: string) {
    console.log("Recipe saved:", url)
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex-1 overflow-y-auto bg-gray-100" ref={containerRef}>
        {messages.length === 0 ? (
          <QuickActions 
            actions={quickActions}
            surpriseAction={handleSurpriseAction}
            onPromptClick={handleQuickPrompt}
          />
        ) : (
          <div className="p-4 space-y-4">
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
        )}
      </div>
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200">
        <ChatInput 
          ref={chatInputRef} 
          onSend={handleSendMessage} 
          isLoading={isLoading}
          isExpanded={isInputExpanded}
          placeholder={inputPlaceholder}
        />
      </div>
    </div>
  )
} 
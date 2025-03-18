"use client"

import { useRef, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Camera, Link, User, FileText, Globe, MessageSquare } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ChatInput, ChatInputHandle } from "./chat-input"
import { QuickActions } from "./quick-actions"
import { UserInput, ChatMessageData, BotMessageType, BotErrorMessageType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store/chat-store"
import { useChatApi } from "@/hooks/use-chat-api"
import { RotateCcw } from "lucide-react"

export function Chat() {
  const { 
    messages, 
    setMessages, 
    clearConversation,
  } = useChatStore()
  
  const { 
    isLoading, 
    sendMessage, 
    retryMessage 
  } = useChatApi({
    onError: handleApiError
  })
  
  const [isInputExpanded, setIsInputExpanded] = useState(false)
  const [inputPlaceholder, setInputPlaceholder] = useState("Typ hier je bericht...")
  const conversationId = useState(() => uuidv4())[0]
  const containerRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)

  // Scroll to bottom when messages change
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

  function handleApiError(errorMessage: string, userInput: UserInput) {
    setMessages((prev: ChatMessageData[]) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage.type !== "bot_loading") return prev
      
      return [
        ...prev.slice(0, -1),
        {
          id: lastMessage.id,
          type: "bot_error",
          botResponse: {
            content: errorMessage || "Sorry, er is iets mis gegaan. Probeer het opnieuw.",
            type: "text"
          },
          userInputToRetry: userInput
        }
      ]
    })
  }

  // UI interaction handlers
  async function handleSendMessage(userInput: UserInput) {
    await sendMessage(userInput)

    setIsInputExpanded(false)
    setInputPlaceholder("Typ hier je bericht...")
  }

  async function handleRetry(message: BotErrorMessageType) {
    setMessages((prev: ChatMessageData[]) => prev.map((msg: ChatMessageData) => 
      msg.id === message.id ? { ...msg, type: "bot_loading", isLoading: true } : msg
    ))

    await retryMessage(message.userInputToRetry, message.id)
  }

  async function handleRecipeSaved(url: string) {
    console.log("Recipe saved:", url)
    // Implement recipe saving functionality
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex-1 overflow-y-auto bg-gray-100 relative" ref={containerRef}>
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearConversation}
            data-testid="reset-chat"
            className="text-xs text-gray-500 hover:text-gray-700 absolute left-2 z-10 bg-gray-100/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Begin opnieuw
          </Button>
        )}
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
        {isLoading && (
          <ChatMessage 
            message={{
              id: uuidv4(),
              type: "bot_loading",
              isLoading: true
            }}
            onRecipeSaved={handleRecipeSaved}
            isLastMessage={true}
            onRetry={handleRetry}
          />
        )}
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
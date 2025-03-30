"use client"

import { useRef, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Link, FileText, ChevronDown } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ChatInput, ChatInputHandle } from "./chat-input"
import { QuickActions } from "./quick-actions"
import { UserInput, ChatMessageData, BotErrorMessageType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store/chat-store"
import { useConversationHistory } from "@/hooks/use-conversation-history"
import { useChat } from "@/hooks/use-chat"
import { useScrollContainer } from "@/hooks/use-scroll-container"

export function Chat() {
  const { 
    isLoading, 
    sendMessage, 
    retryMessage,
    messages,
    setMessages
  } = useChat({
    onError: handleApiError
  })

  const { conversationId } = useChatStore()
  const { history, isLoading: isHistoryLoading, mutate: mutateHistory } = useConversationHistory(conversationId)

  // Set initial messages from history
  useEffect(() => {
    if (history) {
      setMessages(history)
    }
  }, [history, setMessages])
  
  const [isInputExpanded, setIsInputExpanded] = useState(false)
  const [inputPlaceholder, setInputPlaceholder] = useState("Typ hier je bericht...")
  const [hasSelectedFilters, setHasSelectedFilters] = useState(false)
  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0)
  const chatInputRef = useRef<ChatInputHandle>(null)

  const { containerRef, showScrollButton, scrollToBottom } = useScrollContainer({
    dependencies: [messages]
  })

  // Directly handle filter result submission
  const [generateRecipePrompt, setGenerateRecipePrompt] = useState<string | null>(null)

  function handleSurpriseAction() {
    handleSendMessage({ message: `Verras me maar!`, webContent: [{url: "https://random.com", content: `Geef drie random recepten opties. ${uuidv4()}`}] })
  }

  function handleFilterSelectionChange(hasFilters: boolean, count: number, prompt: string) {
    setHasSelectedFilters(hasFilters)
    setSelectedFiltersCount(count)
    setGenerateRecipePrompt(prompt)
  }

  function handleGenerateRecipe() {
    if (generateRecipePrompt) {
      handleSendMessage({ message: generateRecipePrompt, webContent: [] })
      setGenerateRecipePrompt(null)
    }
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
    
    // Reset filter state after sending a message
    setHasSelectedFilters(false)
    setSelectedFiltersCount(0)
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
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      <div className="flex-1 overflow-y-auto bg-gray-100 relative" ref={containerRef}>
        {messages.length === 0 && !isHistoryLoading ? (
          <QuickActions 
            actions={quickActions}
            surpriseAction={handleSurpriseAction}
            onPromptClick={handleQuickPrompt}
            onFilterSelectionChange={handleFilterSelectionChange}
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
        {showScrollButton && (
          <div className="sticky bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={scrollToBottom}
              className="rounded-full bg-white shadow-md hover:bg-gray-50 flex items-center gap-2 px-4 py-2 text-center"
            >
              <ChevronDown className="h-4 w-4 text-black" />
              <span className="text-black">Toon meer</span>
            </Button>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200">
        {messages.length === 0 && hasSelectedFilters ? (
          <div className="p-4">
            <Button 
              onClick={handleGenerateRecipe}
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              Recept genereren met {selectedFiltersCount} {selectedFiltersCount === 1 ? 'filter' : 'filters'}
            </Button>
          </div>
        ) : (
          <ChatInput 
            ref={chatInputRef} 
            onSend={handleSendMessage} 
            isLoading={isLoading}
            isExpanded={isInputExpanded}
            placeholder={inputPlaceholder}
          />
        )}
      </div>
    </div>
  )
} 
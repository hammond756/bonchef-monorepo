"use client"

import { useRef, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "./chat-message"
import { ChatInput, ChatInputHandle } from "./chat-input"
import { QuickActions } from "./quick-actions"
import { UserInput, ChatMessageData, BotErrorMessageType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store/chat-store"
import { useConversationHistory } from "@/hooks/use-conversation-history"
import { useChat } from "@/hooks/use-chat"
import { useScrollContainer } from "@/hooks/use-scroll-container"
import { ShowMoreButton } from "./ui/show-more-button"

export function Chat() {
  const { 
    isLoading, 
    sendMessage, 
    retryMessage,
    messages,
    setMessages
  } = useChat({
    onError: handleApiError,
    onComplete: handleConversationComplete
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
  const chatInputContainerRef = useRef<HTMLDivElement>(null)
  const [chatInputHeight, setChatInputHeight] = useState(0)

  const { containerRef, showScrollButton, scrollToBottom } = useScrollContainer({
    dependencies: [messages]
  })

  useEffect(() => {
    const element = chatInputContainerRef.current
    if (element) {
      setChatInputHeight(element.offsetHeight)
      const resizeObserver = new ResizeObserver(() => {
        setChatInputHeight(element.offsetHeight)
      })
      resizeObserver.observe(element)
      return () => resizeObserver.disconnect()
    }
  }, [])

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
            payload: {
              type: "text"
            }
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

  // TODO: should we even still do retries??
  async function handleRetry(message: BotErrorMessageType) {
    if (!message.id) {
      return;
    }

    setMessages((prev: ChatMessageData[]) => prev.map((msg: ChatMessageData) => 
      msg.id === message.id ? { ...msg, type: "bot_loading", isLoading: true } : msg
    ))

    await retryMessage(message.userInputToRetry, message.id)
  }

  async function handleRecipeSaved(url: string) {
    console.log("Recipe saved:", url)
    // Implement recipe saving functionality
  }

  function handleConversationComplete(conversationId: string, finalMessages: ChatMessageData[]) {
    setTimeout(() => {
      mutateHistory()
    }, 1000)
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div 
        className="flex-1 overflow-y-auto relative" 
        ref={containerRef}
        style={{ paddingBottom: chatInputHeight ? `${chatInputHeight}px` : 'var(--chat-input-height)' }}
      >
        {messages.length === 0 && !isHistoryLoading ? (
          <QuickActions 
            actions={[]}
            surpriseAction={handleSurpriseAction}
            onPromptClick={handleQuickPrompt}
            onFilterSelectionChange={handleFilterSelectionChange}
          />
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index}
                message={message}
                onRecipeSaved={handleRecipeSaved}
                isLastMessage={index === messages.length - 1}
                onRetry={handleRetry}
              />
            ))}
            {isLoading && (
              <ChatMessage 
                message={{
                  id: null,
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
        {showScrollButton && <ShowMoreButton onClick={scrollToBottom} />}
      </div>
      <div 
        ref={chatInputContainerRef}
        className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200"
      >
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
import { Loader2, RotateCcw } from "lucide-react"
import { SaveRecipeButton } from "./save-recipe-button"
import { Button } from "@/components/ui/button"
import { BotErrorMessageType, ChatMessageData as ChatMessageType, GeneratedRecipe } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { useState, useEffect } from "react"
import { RecipeTeaserCard } from "./recipe-teaser-card"
import { RecipeModal } from "./recipe-modal"

interface ChatMessageProps {
  message: ChatMessageType
  onRecipeSaved: (url: string) => void
  isLastMessage: boolean
  onRetry?: (message: BotErrorMessageType) => void
}

export function ChatMessage({ 
  message, 
  onRecipeSaved, 
  isLastMessage,
  onRetry,
}: ChatMessageProps) {
  let displayText = ""
  
  if (message.type === "user") {
    displayText = message.userInput.message
  } else if (message.type === "bot") {
    displayText = message.botResponse.content
  } else if (message.type === "bot_error") {
    displayText = message.botResponse.content
  } else if (message.type === "bot_loading") {
    displayText = "Laden..."
  }

  function renderMessageContent() {
    // Show loading state for last bot message
    if (message.type === "bot_loading") {
      return (
        <div className="flex items-center space-x-2" data-testid="chat-message-loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{displayText}</span>
        </div>
      )
    }

    // Show error state with retry button
    if (message.type === "bot_error") {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-red-500">{displayText}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRetry?.(message)}
            className="w-fit"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )
    }

    // Handle teaser messages
    if (message.type === "bot" && message.botResponse.payload.type === "teaser") {
      return (
        <div className="w-full">
          <RecipeTeaserCard 
            messageId={message.id}
            initialRecipe={message.botResponse.payload.recipe}
            content={message.botResponse.content}
          />
        </div>
      )
    }

    // Show regular message content with markdown rendering
    return (
      <div className="break-words markdown-content [&_p]:my-1 [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-2xl [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
        <ReactMarkdown 
          rehypePlugins={[rehypeSanitize]}
          components={{
            a: ({ node, ...props }) => (
              <a 
                {...props} 
                className="text-blue-500 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className="list-decimal pl-4" />
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} className="list-disc pl-4" />
            ),
            p: ({ node, ...props }) => (
              <p {...props} className="py-1 whitespace-pre-wrap" />
            ),
            h1: ({ node, ...props }) => (
              <h1 {...props} className="text-2xl font-bold" />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} className="text-xl font-bold" />
            ),
            h3: ({ node, ...props }) => (
              <h3 {...props} className="text-lg font-bold" />
            ),
            h4: ({ node, ...props }) => (
              <h4 {...props} className="text-base font-bold" />
            ),
          }}
        >
          {displayText || ""}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col w-full ${message.type === "user" ? "items-end" : "items-start"}`}
      data-testid="chat-message"
    >
      <div
        className={`w-full ${
          message.type === "user" 
            ? "max-w-[80%] rounded-lg p-4 bg-white text-black" 
            : "text-black"
        }`}
      >
        {renderMessageContent()}
        
        {message.type === "bot" && message.botResponse.payload.type === "recipe" && (
          <div className="mt-4">
            <SaveRecipeButton
              message={message.botResponse.content} 
              onSaved={onRecipeSaved}
            />
          </div>
        )}
      </div>
    </div>
  )
} 
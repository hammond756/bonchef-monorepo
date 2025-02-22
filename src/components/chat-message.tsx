import { Loader2, RotateCcw } from "lucide-react"
import { SaveRecipeButton } from "./save-recipe-button"
import { Button } from "@/components/ui/button"
import { BotErrorMessageType, ChatMessageData as ChatMessageType } from "@/lib/types"

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
  onRetry 
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

    // Show regular message content with clickable links
    return (
      <p className="whitespace-pre-wrap break-words">
        {(displayText || "").split(/(https?:\/\/[^\s]+)/).map((part, i) => {
          if (part.match(/^https?:\/\//)) {
            return (
              <a 
                key={i} 
                href={part} 
                className="text-blue-500 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {part}
              </a>
            )
          }
          return part
        })}
      </p>
    )
  }

  return (
    <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.type === "user" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        {renderMessageContent()}
      </div>
      
      {message.type === "bot" && (
        <div className="mt-2 ml-2">
          <SaveRecipeButton
            message={message.botResponse.content} 
            onSaved={onRecipeSaved}
          />
        </div>
      )}
    </div>
  )
} 
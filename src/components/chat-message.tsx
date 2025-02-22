import { Loader2, RotateCcw } from "lucide-react"
import { SaveRecipeButton } from "./save-recipe-button"
import { Button } from "@/components/ui/button"
import { ChatMessageData as ChatMessageType } from "@/lib/types"

interface ChatMessageProps {
  message: ChatMessageType
  onRecipeSaved: (url: string) => void
  isLoading: boolean
  isLastMessage: boolean
  onRetry?: (messageId: string) => void
}

export function ChatMessage({ 
  message, 
  onRecipeSaved, 
  isLoading, 
  isLastMessage,
  onRetry 
}: ChatMessageProps) {
  // Get the display text based on message type
  const displayText = message.isUser 
    ? message.userInput?.message 
    : message.botResponse?.content || message.botResponse?.error

  return (
    <div className={`flex flex-col ${message.isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.isUser
            ? "bg-white text-black"
            : "bg-gray-900 text-white"
        }`}
      >
        {!message.isUser && isLastMessage && isLoading ? (
          <div className="flex items-center space-x-2" data-testid="chat-message-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Laden...</span>
          </div>
        ) : message.isError ? (
          <div className="flex flex-col gap-2">
            <p className="text-red-500">{displayText}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRetry?.(message.id)}
              className="w-fit"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
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
        )}
      </div>
      {!message.isUser && !isLoading && message.botResponse && (
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
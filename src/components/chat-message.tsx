import { Loader2, RotateCcw } from "lucide-react"
import { SaveRecipeButton } from "./save-recipe-button"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: {
    id: string
    text: string
    isUser: boolean
    isLoading?: boolean
    isError?: boolean
  }
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
            <p className="text-red-500">{message.text}</p>
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
            {message.text.split(/(https?:\/\/[^\s]+)/).map((part, i) => {
              if (part.match(/^https?:\/\//)) {
                return <a key={i} href={part} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{part}</a>
              }
              return part
            })}
          </p>
        )}
      </div>
      {!message.isUser && !isLoading && (
        <div className="mt-2 ml-2">
          <SaveRecipeButton
            message={message.text} 
            onSaved={onRecipeSaved}
          />
        </div>
      )}
    </div>
  )
} 
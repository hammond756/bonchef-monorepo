import { Loader2 } from "lucide-react"
import { SaveRecipeButton } from "./save-recipe-button"

interface ChatMessageProps {
  message: {
    text: string
    isUser: boolean
  }
  onRecipeSaved: (url: string) => void
  isLoading: boolean
  isLastMessage: boolean
}

export function ChatMessage({ 
  message, 
  onRecipeSaved, 
  isLoading, 
  isLastMessage 
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
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
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
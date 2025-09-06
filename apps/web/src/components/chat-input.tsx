"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { Button } from "./ui/button"
import { UrlStatusList } from "./url-status-list"
import { SendIcon, ImageIcon, X, Loader2 } from "lucide-react"
import AutoGrowingTextarea from "./ui/auto-growing-textarea"
import Image from "next/image"
import { useChatInput } from "@/hooks/use-chat-input"
import { UserInput } from "@/lib/types"

interface ChatInputProps {
    onSend: (userInput: UserInput) => void
    isLoading: boolean
    isExpanded?: boolean
    placeholder?: string
}

export interface ChatInputHandle {
    focus: () => void
}

const ChatInputBase = (
    {
        onSend,
        isLoading,
        isExpanded = false,
        placeholder = "Typ hier je bericht...",
    }: Readonly<ChatInputProps>,
    ref: React.Ref<ChatInputHandle>
) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const {
        message,
        urlStatuses,
        preview,
        isUploading,
        error,
        shouldJiggle,
        fileInputRef,
        handleTextareaChange,
        handleImageUpload,
        handleRemoveImage,
        handleSubmit,
        handleKeyDown,
    } = useChatInput({ onSend, isLoading })

    useImperativeHandle(ref, () => ({
        focus: () => {
            textareaRef.current?.focus()
        },
    }))

    return (
        <form onSubmit={handleSubmit} className="bg-surface border-t p-4">
            <UrlStatusList urls={urlStatuses} className={shouldJiggle ? "animate-jiggle" : ""} />
            {preview && (
                <div className="relative mb-2 w-full max-w-[200px]">
                    <Image
                        src={preview}
                        alt="Uploaded image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                        data-testid="uploaded-image-preview"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="bg-overlay-dark text-surface hover:bg-overlay-dark/80 absolute top-1 right-1 h-6 w-6 rounded-full"
                        data-testid="remove-image-button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {error && <p className="text-status-red-text mb-2 text-sm">{error}</p>}
            <div
                className={`bg-accent focus-within:ring-primary flex items-center space-x-2 rounded-2xl p-2 transition-shadow focus-within:ring-2 ${isExpanded ? "shadow-md" : "shadow-sm"}`}
            >
                <div className="flex-shrink-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/heic"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="image-upload-input"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="h-[40px] w-[40px] self-end"
                    data-testid="image-upload-button"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="h-4 w-4" />
                    )}
                </Button>
                <AutoGrowingTextarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    placeholder={placeholder}
                    disabled={isLoading}
                    data-testid="chat-input"
                    className={`resize-none overflow-hidden px-3 py-1.5 leading-tight transition-all duration-200 ${
                        isExpanded ? "max-h-[144px] min-h-[144px]" : "max-h-[144px] min-h-[36px]"
                    }`}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    type="submit"
                    disabled={
                        isLoading || urlStatuses.some((s) => s.status === "loading") || isUploading
                    }
                    data-testid="send-button"
                    className="h-[40px] self-end px-3"
                >
                    <SendIcon className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(ChatInputBase)

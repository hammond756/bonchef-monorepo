"use client"

import { useRef, useEffect } from "react"
import { TextareaWithError } from "@/components/ui/textarea-with-error"
import { cn } from "@/lib/utils"

interface AutoResizeTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    maxLength?: number
    minRows?: number
    maxRows?: number
    ariaLabel?: string
    error?: string
}

export function AutoResizeTextarea({
    value,
    onChange,
    placeholder,
    className,
    maxLength = 500,
    minRows = 3,
    maxRows = 10,
    ariaLabel,
    error,
}: AutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto"

        // Calculate the new height
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
        const minHeight = lineHeight * minRows
        const maxHeight = lineHeight * maxRows
        const scrollHeight = textarea.scrollHeight

        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
        textarea.style.height = `${newHeight}px`
    }

    useEffect(() => {
        adjustHeight()
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        if (newValue.length <= maxLength) {
            onChange(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.shiftKey) {
            // Allow new line with Shift+Enter
            return
        }
        if (e.key === "Enter") {
            // Prevent default Enter behavior (form submission)
            e.preventDefault()
        }
    }

    return (
        <div className={cn("relative", className)}>
            <TextareaWithError
                ref={textareaRef}
                value={value || ""}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="resize-none overflow-hidden"
                maxLength={maxLength}
                aria-label={ariaLabel}
                error={error}
            />
            {!!maxLength && (
                <div className="text-muted-foreground absolute right-2 bottom-2 text-xs">
                    {(value || "").length}/{maxLength}
                </div>
            )}
        </div>
    )
}

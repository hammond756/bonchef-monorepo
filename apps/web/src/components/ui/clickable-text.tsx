"use client"

import React from "react"

interface ClickableTextProps {
    text: string
    className?: string
}

export function ClickableText({ text, className }: ClickableTextProps) {
    const urlRegex = /(\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+)/g
    const parts = text.split(urlRegex)

    return (
        <p className={className}>
            {parts.map((part, index) => {
                if (part && part.match(urlRegex)) {
                    const href = part.startsWith("www.") ? `//${part}` : part
                    return (
                        <a
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    )
                }
                return <React.Fragment key={index}>{part}</React.Fragment>
            })}
        </p>
    )
}

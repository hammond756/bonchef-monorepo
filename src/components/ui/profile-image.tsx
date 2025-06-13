import Image from "next/image"
import Avatar from "boring-avatars"
import React from "react"

interface ProfileImageProps {
    src?: string | null
    name?: string | null
    size?: number
    alt?: string
    className?: string
}

export function ProfileImage({
    src,
    name,
    size = 40,
    alt = "Avatar",
    className = "",
}: ProfileImageProps) {
    if (src) {
        return (
            <span
                style={{ width: size, height: size, display: "inline-block" }}
                className={`relative overflow-hidden rounded-full ${className}`}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    style={{ objectFit: "cover" }}
                    className="aspect-square h-full w-full rounded-full"
                />
            </span>
        )
    }
    return (
        <span style={{ width: size, height: size, display: "inline-block" }}>
            <Avatar
                size={size}
                name={name || "Anon"}
                variant="bauhaus"
                className={`${className} rounded-full`}
                colors={[
                    "#E6EEF6", // soft blue
                    "#1A2A36", // navy
                    "#7BC47F", // green
                    "#F5F7FA", // very light gray
                    "#F5B971", // orange
                ]}
            />
        </span>
    )
}

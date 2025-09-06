import Avatar from "boring-avatars"
import React from "react"

interface ProfileImageProps {
    name?: string | null
    src?: string | null
    size?: number
    className?: string
}

export function ProfileImage({ name, src, size = 40, className = "" }: ProfileImageProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name || "User avatar"}
                width={size}
                height={size}
                className={`${className} rounded-full object-cover`}
                style={{ width: size, height: size }}
            />
        )
    }

    return (
        <span style={{ width: size, height: size, display: "inline-block" }}>
            <Avatar
                size={size}
                name={name || "Anon"}
                variant="beam"
                className={`${className} rounded-full`}
                colors={[
                    "#E7F3FB", // blue-1
                    "#E5F7EB", // green-1
                    "#FFF9D9", // yellow-1
                    "#FFFFFF", // red-1
                    "#B3D8F2", // blue-border
                ]}
            />
        </span>
    )
}

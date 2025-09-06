"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Mobile detection hook
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkIsMobile()
        window.addEventListener("resize", checkIsMobile)

        return () => window.removeEventListener("resize", checkIsMobile)
    }, [])

    return isMobile
}

// Touch-friendly button component
interface TouchButtonProps {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: "default" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
}

export function TouchButton({
    children,
    onClick,
    disabled = false,
    className,
    variant = "default",
    size = "md",
}: TouchButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantClasses = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
    }

    const sizeClasses = {
        sm: "h-10 px-3 text-sm",
        md: "h-12 px-4 text-base",
        lg: "h-14 px-6 text-lg",
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                "min-h-[44px]", // Ensure minimum touch target size
                className
            )}
        >
            {children}
        </button>
    )
}

// Mobile keyboard management
export function useMobileKeyboard() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
    const [viewportHeight, setViewportHeight] = useState(0)

    useEffect(() => {
        const updateViewportHeight = () => {
            setViewportHeight(window.visualViewport?.height || window.innerHeight)
        }

        const handleResize = () => {
            const newHeight = window.visualViewport?.height || window.innerHeight
            setIsKeyboardOpen(newHeight < window.innerHeight)
            setViewportHeight(newHeight)
        }

        updateViewportHeight()
        window.addEventListener("resize", handleResize)
        window.visualViewport?.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.visualViewport?.removeEventListener("resize", handleResize)
        }
    }, [])

    return {
        isKeyboardOpen,
        viewportHeight,
    }
}

// Mobile scroll optimization
export function useMobileScroll() {
    const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null)
    const [scrollY, setScrollY] = useState(0)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const direction = currentScrollY > lastScrollY.current ? "down" : "up"

            setScrollDirection(direction)
            setScrollY(currentScrollY)
            lastScrollY.current = currentScrollY
        }

        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return {
        scrollDirection,
        scrollY,
    }
}

// Mobile gesture detection
export function useMobileGestures() {
    const [gesture, setGesture] = useState<
        "swipe-left" | "swipe-right" | "swipe-up" | "swipe-down" | null
    >(null)
    const touchStart = useRef<{ x: number; y: number } | null>(null)

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0]
            touchStart.current = { x: touch.clientX, y: touch.clientY }
        }

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart.current) return

            const touch = e.changedTouches[0]
            const deltaX = touch.clientX - touchStart.current.x
            const deltaY = touch.clientY - touchStart.current.y
            const minSwipeDistance = 50

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    setGesture(deltaX > 0 ? "swipe-right" : "swipe-left")
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    setGesture(deltaY > 0 ? "swipe-down" : "swipe-up")
                }
            }

            touchStart.current = null
        }

        document.addEventListener("touchstart", handleTouchStart, { passive: true })
        document.addEventListener("touchend", handleTouchEnd, { passive: true })

        return () => {
            document.removeEventListener("touchstart", handleTouchStart)
            document.removeEventListener("touchend", handleTouchEnd)
        }
    }, [])

    return { gesture }
}

// Mobile-safe area utilities
export function SafeAreaTop({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return <div className={cn("pt-safe-area-top", className)}>{children}</div>
}

export function SafeAreaBottom({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return <div className={cn("pb-safe-area-bottom", className)}>{children}</div>
}

// Mobile-optimized input component
interface MobileInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: "text" | "number" | "email" | "tel"
    className?: string
    disabled?: boolean
}

export function MobileInput({
    value,
    onChange,
    placeholder,
    type = "text",
    className,
    disabled = false,
}: MobileInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "min-h-[44px]", // Ensure minimum touch target
                "text-base", // Prevent zoom on iOS
                className
            )}
            style={{ fontSize: "16px" }} // Prevent zoom on iOS
        />
    )
}

// Mobile-optimized textarea component
interface MobileTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    rows?: number
}

export function MobileTextarea({
    value,
    onChange,
    placeholder,
    className,
    disabled = false,
    rows = 3,
}: MobileTextareaProps) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "min-h-[44px]", // Ensure minimum touch target
                "text-base", // Prevent zoom on iOS
                className
            )}
            style={{ fontSize: "16px" }} // Prevent zoom on iOS
        />
    )
}

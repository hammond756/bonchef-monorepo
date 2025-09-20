"use client"

import { useState, useEffect, useCallback } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NavigationWarningDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    onCancel: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
}

export function NavigationWarningDialog({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title = "Niet-opgeslagen wijzigingen",
    description = "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?",
    confirmText = "Vertrekken",
    cancelText = "Blijven",
}: NavigationWarningDialogProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} aria-label={cancelText}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        aria-label={confirmText}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// Hook for managing navigation warnings
export function useNavigationWarningDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

    const showWarning = useCallback((navigationCallback: () => void) => {
        setPendingNavigation(() => navigationCallback)
        setIsOpen(true)
    }, [])

    const handleConfirm = useCallback(() => {
        setIsOpen(false)
        if (pendingNavigation) {
            pendingNavigation()
            setPendingNavigation(null)
        }
    }, [pendingNavigation])

    const handleCancel = useCallback(() => {
        setIsOpen(false)
        setPendingNavigation(null)
    }, [])

    return {
        isOpen,
        showWarning,
        handleConfirm,
        handleCancel,
    }
}

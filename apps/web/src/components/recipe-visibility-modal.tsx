"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Globe, Lock, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RecipeVisibilityModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (isPublic: boolean) => void
    defaultVisibility?: boolean
}

export function RecipeVisibilityModal({
    isOpen,
    onClose,
    onConfirm,
    defaultVisibility = false,
}: RecipeVisibilityModalProps) {
    const [isPublic, setIsPublic] = useState<boolean>(defaultVisibility)

    const handleConfirm = () => {
        onConfirm(isPublic)
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 grid h-screen place-items-center bg-black/30 px-6 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="bg-surface relative w-full max-w-md rounded-2xl p-6 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recept opslaan</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Sluiten">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Kies hoe je dit recept wilt opslaan
                    </p>
                    <div className="space-y-4">
                        <RadioGroup
                            value={isPublic ? "public" : "private"}
                            onValueChange={(value: string) => setIsPublic(value === "public")}
                            className="flex flex-col space-y-4"
                        >
                            <div className="flex items-start space-y-0 space-x-3">
                                <RadioGroupItem value="private" id="private" />
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="private"
                                        className="flex items-center gap-2 font-medium"
                                    >
                                        <Lock className="h-4 w-4" />
                                        Privé
                                    </Label>
                                    <p className="text-muted-foreground text-sm">
                                        Alleen jij kunt dit recept zien in je persoonlijke collectie
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-y-0 space-x-3">
                                <RadioGroupItem value="public" id="public" />
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="public"
                                        className="flex items-center gap-2 font-medium"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Openbaar
                                    </Label>
                                    <p className="text-muted-foreground text-sm">
                                        Iedereen kan dit recept bekijken en gebruiken
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                        <div className="flex justify-between gap-3">
                            <Button variant="outline" onClick={onClose} className="flex-1" aria-label="Opslaan annuleren">
                                Annuleren
                            </Button>
                            <Button onClick={handleConfirm} className="flex-1" aria-label="Bevestig zichtbaarheid">
                                Opslaan
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Globe, Lock } from "lucide-react"

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Recept opslaan</DialogTitle>
                    <DialogDescription>Kies hoe je dit recept wilt opslaan</DialogDescription>
                </DialogHeader>
                <div className="py-4">
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
                </div>
                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button variant="outline" onClick={onClose}>
                        Annuleren
                    </Button>
                    <Button onClick={handleConfirm}>Opslaan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

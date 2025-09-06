"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useState } from "react"

interface ImageGenerationModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (settings: { camera_angle?: string; keukenstijl?: string }) => void
}

const CAMERA_ANGLES = [
    {
        label: "Bovenaanzicht",
        value: "Top Down",
    },
    {
        label: "Close-up",
        value: "Close up",
    },
    {
        label: "Extreme close-up",
        value: "Extreme close up, no only food and plate visible",
    },
    {
        label: "Omgevingsshot",
        value: "Scenic shot, with environment and background",
    },
]

const KITCHEN_STYLES = [
    {
        label: "Modern minimalistisch",
        value: "Modern minimal, stainless steel",
    },
    {
        label: "Warm landelijk",
        value: "Warm, countryside, natural wood",
    },
    {
        label: "High-end marmer",
        value: "High end, marble stone",
    },
    {
        label: "Frans klassiek",
        value: "French classic, elegant, tablecloth",
    },
    {
        label: "Buitenkeuken",
        value: "Outside kitchen with plants and flowers",
    },
]

export function ImageGenerationModal({ isOpen, onClose, onSubmit }: ImageGenerationModalProps) {
    const [cameraAngle, setCameraAngle] = useState<string | undefined>()
    const [kitchenStyle, setKitchenStyle] = useState<string | undefined>()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Afbeelding instellingen</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Camera hoek</h3>
                        <RadioGroup
                            value={cameraAngle}
                            onValueChange={setCameraAngle}
                            className="space-y-2"
                        >
                            {CAMERA_ANGLES.map((angle) => (
                                <div key={angle.label} className="flex items-center space-x-2">
                                    <RadioGroupItem value={angle.value} id={angle.label} />
                                    <Label htmlFor={angle.label}>{angle.label}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCameraAngle(undefined)}
                                >
                                    Wissen
                                </Button>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Keukensetting</h3>
                        <RadioGroup
                            value={kitchenStyle}
                            onValueChange={setKitchenStyle}
                            className="space-y-2"
                        >
                            {KITCHEN_STYLES.map((style) => (
                                <div key={style.label} className="flex items-center space-x-2">
                                    <RadioGroupItem value={style.value} id={style.label} />
                                    <Label htmlFor={style.label}>{style.label}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setKitchenStyle(undefined)}
                                >
                                    Wissen
                                </Button>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Annuleren
                        </Button>
                        <Button
                            onClick={() => {
                                onSubmit({
                                    camera_angle: cameraAngle,
                                    keukenstijl: kitchenStyle,
                                })
                                onClose()
                            }}
                        >
                            Genereer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState } from "react"
import { DishcoveryCamera } from "./dishcovery-camera"
import { DishcoveryDescription } from "./dishcovery-description"

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

export function DishcoveryLayout() {
    const [currentStep, setCurrentStep] = useState<"camera" | "description">("camera")
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null)

    const handlePhotoCaptured = (photo: CapturedPhoto) => {
        setCapturedPhoto(photo)
        setCurrentStep("description")
    }

    const handleBackToCamera = () => {
        setCurrentStep("camera")
        setCapturedPhoto(null)
    }

    if (currentStep === "camera") {
        return (
            <DishcoveryCamera
                onPhotoCaptured={handlePhotoCaptured}
                onBack={() => {
                    // Navigate back to main app
                    window.history.back()
                }}
            />
        )
    }

    if (currentStep === "description" && capturedPhoto) {
        return (
            <DishcoveryDescription
                photo={capturedPhoto}
                onBack={handleBackToCamera}
                onContinue={(_description) => {
                    // Navigate to collection page after recipe generation
                    window.location.href = "/collection"
                }}
            />
        )
    }

    return null
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DishcoveryCamera } from "@/components/dishcovery/dishcovery-camera"
import { DishcoveryDescription } from "@/components/dishcovery/dishcovery-description"

/**
 * Main page for the Dishcovery feature.
 * Handles the camera flow and navigation to description screen.
 */

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

export default function DishcoveryPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<"camera" | "description">("camera")
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null)

    function handlePhotoCaptured(photo: CapturedPhoto) {
        setCapturedPhoto(photo)
        setCurrentStep("description")
    }

    function handleBackToCamera() {
        setCurrentStep("camera")
        setCapturedPhoto(null)
    }

    if (currentStep === "camera") {
        return <DishcoveryCamera onPhotoCaptured={handlePhotoCaptured} />
    }

    if (currentStep === "description" && capturedPhoto) {
        return (
            <DishcoveryDescription
                photo={capturedPhoto}
                onBack={handleBackToCamera}
                onContinue={(description) => {
                    console.log("Description:", description)
                    // Recipe generation is now handled by the DishcoveryDescription component
                    // The user will be redirected to the collection page after successful generation
                    router.push("/collection")
                }}
            />
        )
    }

    return null
}

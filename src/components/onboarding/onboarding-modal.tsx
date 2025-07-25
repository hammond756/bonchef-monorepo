"use client"

import { ArrowLeft, X } from "lucide-react"
import { WelcomeScreen } from "./welcome-screen"
import { IntroductionScreen } from "./introduction-screen"
import { AddRecipeScreen } from "./add-recipe-screen"
import { SuccessScreen } from "./success-screen"
import { useRouter } from "next/navigation"
import { ONBOARDING_STEPS, useOnboarding } from "@/hooks/use-onboarding"
import { SlideInOverlay } from "@/components/ui/slide-in-overlay"
import { usePostHog } from "posthog-js/react"
import { Progress } from "@/components/ui/progress"

export function OnboardingModal() {
    const router = useRouter()
    const { isOpen, closeModal, currentStepIndex, nextStep, prevStep } = useOnboarding()
    const posthog = usePostHog()

    const currentStep = ONBOARDING_STEPS[currentStepIndex]

    const handleNextStep = () => {
        posthog.capture("onboarding_step_completed", {
            step_index: currentStepIndex,
            total_steps: ONBOARDING_STEPS.length,
        })
        nextStep()
    }

    const handleAcknowledgeSuccess = () => {
        closeModal()
        router.push("/signup")
    }

    const renderStep = () => {
        switch (currentStep) {
            case "welcome":
                return <WelcomeScreen onNext={handleNextStep} onSkip={closeModal} />
            case "introduction":
                return <IntroductionScreen onNext={handleNextStep} />
            case "add-recipe":
                return (
                    <AddRecipeScreen
                        onImportStarted={handleNextStep}
                        onSkip={handleAcknowledgeSuccess}
                    />
                )
            case "success":
                return <SuccessScreen onAcknowledge={handleAcknowledgeSuccess} />
            default:
                return null
        }
    }

    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1
    const progress = (currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100

    return (
        <SlideInOverlay isOpen={isOpen} onClose={closeModal}>
            <div className="flex h-[95vh] max-h-[95vh] w-full flex-col p-0">
                <div className="flex flex-col border-b p-4">
                    <div className="flex flex-row items-center justify-between">
                        <button
                            onClick={prevStep}
                            className={isFirstStep || isLastStep ? "invisible" : ""}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold">Onboarding</h2>
                        <button onClick={closeModal} aria-label="Sluiten">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <Progress value={progress} className="mt-4" />
                </div>
                <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>
            </div>
        </SlideInOverlay>
    )
}

"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import Cookies from "js-cookie"

export const ONBOARDING_STEPS = ["welcome", "introduction", "add-recipe", "success"] as const

const ONBOARDING_SESSION_COOKIE = "onboarding_session_id"

interface OnboardingState {
    isOpen: boolean
    currentStepIndex: number
    onboardingSessionId: string | null
    isLoading: boolean
    openModal: () => void
    closeModal: () => void
    nextStep: () => void
    prevStep: () => void
    reset: () => void
    initializeSession: () => Promise<void>
}

export const useOnboarding = create<OnboardingState>((set) => ({
    isOpen: false,
    currentStepIndex: 0,
    onboardingSessionId: null,
    isLoading: true, // Start in loading state
    initializeSession: async () => {
        try {
            const sessionId = Cookies.get(ONBOARDING_SESSION_COOKIE)
            set({ onboardingSessionId: sessionId || null, isLoading: false })
        } catch (e) {
            console.error("Failed to initialize onboarding session", e)
            set({ onboardingSessionId: null, isLoading: false, isOpen: false })
        }
    },
    openModal: () => {
        set((state) => {
            let sessionId = state.onboardingSessionId
            if (!sessionId) {
                sessionId = uuidv4()
                Cookies.set(ONBOARDING_SESSION_COOKIE, sessionId, { expires: 7 })
            }
            return {
                isOpen: true,
                currentStepIndex: 0,
                onboardingSessionId: sessionId,
            }
        })
    },
    closeModal: () => set({ isOpen: false }),
    nextStep: () =>
        set((state) => ({
            currentStepIndex: Math.min(state.currentStepIndex + 1, ONBOARDING_STEPS.length - 1),
        })),
    prevStep: () =>
        set((state) => ({
            currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
        })),
    reset: () =>
        set({
            isOpen: false,
            currentStepIndex: 0,
            onboardingSessionId: null,
            isLoading: false,
        }),
}))

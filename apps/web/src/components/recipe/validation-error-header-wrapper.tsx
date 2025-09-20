"use client"

import { ValidationErrorHeader } from "./validation-error-header"
import { useRecipeEditContext } from "./recipe-edit-context"
import { ValidationErrorProvider } from "./validation-error-context"
import { useMemo, ReactNode } from "react"

interface ValidationErrorHeaderWrapperProps {
    children: ReactNode
}

export function ValidationErrorHeaderWrapper({ children }: ValidationErrorHeaderWrapperProps) {
    const { errors, isGenerating } = useRecipeEditContext()

    const validationErrors = useMemo(
        () => ({
            ...(errors as Record<string, string | undefined>),
            ...(isGenerating && {
                imageGeneration: "Wacht tot je foto klaar is",
            }),
        }),
        [errors, isGenerating]
    )

    return (
        <>
            <ValidationErrorHeader errors={validationErrors} />
            <ValidationErrorProvider errors={validationErrors}>{children}</ValidationErrorProvider>
        </>
    )
}

"use client"

import { createContext, useContext, ReactNode } from "react"

interface ValidationErrorContextValue {
    errors: Record<string, string | undefined>
}

const ValidationErrorContext = createContext<ValidationErrorContextValue | null>(null)

interface ValidationErrorProviderProps {
    children: ReactNode
    errors: Record<string, string | undefined>
}

export function ValidationErrorProvider({ children, errors }: ValidationErrorProviderProps) {
    return (
        <ValidationErrorContext.Provider value={{ errors }}>
            {children}
        </ValidationErrorContext.Provider>
    )
}

export function useValidationErrors() {
    const context = useContext(ValidationErrorContext)
    if (!context) {
        return { errors: {} }
    }
    return context
}

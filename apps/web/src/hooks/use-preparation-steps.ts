import { useState, useCallback, useMemo } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { v4 as uuidv4 } from "uuid"

// Internal state representation with a stable ID
export interface UIStep {
    id: string
    content: string
}

// API of commands the hook exposes
export interface PreparationStepsAPI {
    addStep: () => void
    deleteStep: (stepId: string) => void
    updateStep: (stepId: string, content: string) => void
    reorderStep: (oldIndex: number, newIndex: number) => void
}

const normalizeToRecipeFormat = (steps: UIStep[]): string[] => {
    return steps.map((s) => s.content)
}

export const usePreparationSteps = (
    initialSteps: string[],
    onChange?: (steps: string[]) => void
): [UIStep[], PreparationStepsAPI] => {
    const [steps, setSteps] = useState<UIStep[]>(() =>
        initialSteps.map((s) => ({
            id: uuidv4(),
            content: s,
        }))
    )

    const handleStateChange = (newSteps: UIStep[]) => {
        setSteps(newSteps)
        if (onChange) {
            onChange(normalizeToRecipeFormat(newSteps))
        }
    }

    const addStep = useCallback(() => {
        const newStep: UIStep = {
            id: uuidv4(),
            content: "",
        }
        handleStateChange([...steps, newStep])
    }, [steps, handleStateChange])

    const deleteStep = useCallback(
        (stepId: string) => {
            handleStateChange(steps.filter((s) => s.id !== stepId))
        },
        [steps, handleStateChange]
    )

    const updateStep = useCallback(
        (stepId: string, content: string) => {
            const newSteps = steps.map((s) => (s.id === stepId ? { ...s, content } : s))
            handleStateChange(newSteps)
        },
        [steps, handleStateChange]
    )

    const reorderStep = useCallback(
        (oldIndex: number, newIndex: number) => {
            handleStateChange(arrayMove(steps, oldIndex, newIndex))
        },
        [steps, handleStateChange]
    )

    const api = useMemo(
        () => ({
            addStep,
            deleteStep,
            updateStep,
            reorderStep,
        }),
        [addStep, deleteStep, updateStep, reorderStep]
    )

    return [steps, api]
}

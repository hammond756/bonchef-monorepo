"use client"

import React, { useState } from "react"
import { Card } from "./ui/card"
import { ClockIcon, CheckIcon } from "lucide-react"

export interface InstructionStep {
    id: string
    text: string
    time?: number
}

export interface RecipeInstructionsProps {
    instructions: InstructionStep[]
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
    const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set())

    const toggleStep = (stepId: string) => {
        setCheckedSteps((prev) => {
            const newChecked = new Set(prev)
            if (newChecked.has(stepId)) {
                newChecked.delete(stepId)
            } else {
                newChecked.add(stepId)
            }
            return newChecked
        })
    }

    if (!instructions || instructions.length === 0) {
        return (
            <Card className="text-muted-foreground rounded-lg p-6 text-center">
                Geen instructies gevonden voor dit recept.
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <ol className="m-0 list-none space-y-4 p-0">
                {instructions.map((step, index) => {
                    const isChecked = checkedSteps.has(step.id)
                    return (
                        <li
                            key={step.id}
                            className={`flex cursor-pointer items-start space-x-4 rounded-lg border p-4 transition-colors ${isChecked ? "border-green-200 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                            onClick={() => toggleStep(step.id)}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    toggleStep(step.id)
                                }
                            }}
                        >
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 data-[checked=true]:border-green-600 data-[checked=true]:bg-green-600 data-[checked=true]:text-white"
                                data-checked={isChecked}
                            >
                                {isChecked ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-semibold text-gray-700">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <span
                                    className={`block text-sm font-medium ${isChecked ? "text-gray-500 line-through" : "text-gray-800"}`}
                                >
                                    {step.text}
                                </span>
                                {step.time !== undefined && (
                                    <div className="mt-1.5 flex items-center text-sm text-gray-500">
                                        <ClockIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                        <span>{step.time} min</span>
                                    </div>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

"use client"

import React, { useState } from "react"
import { Card } from "./ui/card"
import { ClockIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InstructionStep {
    id: string
    text: string
    time?: number
}

interface RecipeInstructionsProps {
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
                            className={cn(
                                "flex cursor-pointer items-start space-x-4 rounded-lg border p-4 transition-colors",
                                isChecked &&
                                    "bg-green-0 text-muted-foreground decoration-status-green-text border-green-200 line-through"
                            )}
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
                                className="data-[checked=true]:border-primary data-[checked=true]:bg-primary data-[checked=true]:text-surface flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2"
                                data-checked={isChecked}
                            >
                                {isChecked ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    <span className="text-default text-sm font-semibold">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <span
                                    className={cn(
                                        "block text-lg font-normal",
                                        isChecked ? "text-muted-foreground" : "text-default"
                                    )}
                                >
                                    {step.text}
                                </span>
                                {step.time !== undefined && (
                                    <div
                                        className={cn(
                                            "mt-1.5 flex items-center text-sm",
                                            isChecked ? "text-default" : "text-muted"
                                        )}
                                    >
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

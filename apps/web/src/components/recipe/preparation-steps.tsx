"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { UIStep, PreparationStepsAPI } from "@/hooks/use-preparation-steps"

interface PreparationStepsProps {
    steps: UIStep[]
    api: PreparationStepsAPI
    className?: string
}

function SortableStep({
    step,
    index,
    api,
}: {
    step: UIStep
    index: number
    api: PreparationStepsAPI
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: step.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                touchAction: "pan-y",
            }}
            className={cn(
                "bg-card flex touch-manipulation items-start gap-3 rounded-lg border p-4 transition-all select-none",
                isDragging && "z-50 scale-105 opacity-50 shadow-lg"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "mt-2 flex h-10 w-10 flex-shrink-0 cursor-grab items-center justify-center rounded-md select-none active:cursor-grabbing",
                    "hover:bg-muted touch-manipulation",
                    "md:h-8 md:w-8",
                    isDragging && "cursor-grabbing"
                )}
                style={{
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                }}
            >
                <GripVertical className="text-muted-foreground h-5 w-5 md:h-4 md:w-4" />
            </div>

            <div className="flex-grow">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                        Stap {index + 1}
                    </span>
                </div>
                <Textarea
                    value={step.content}
                    onChange={(e) => api.updateStep(step.id, e.target.value)}
                    placeholder="Beschrijf deze stap..."
                    className="min-h-[80px] resize-none"
                    style={{ userSelect: "text", touchAction: "auto" }}
                    onFocus={(e) => e.stopPropagation()}
                    autoFocus={step.content.trim() === ""}
                />
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => api.deleteStep(step.id)}
                className="text-destructive hover:text-destructive mt-2 h-auto p-1"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function PreparationSteps({ steps, api, className }: PreparationStepsProps) {
    const [activeStepId, setActiveStepId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveStepId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveStepId(null)

        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id)
            const newIndex = steps.findIndex((s) => s.id === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                api.reorderStep(oldIndex, newIndex)
            }
        }
    }

    const activeStep = useMemo(
        () => steps.find((s) => s.id === activeStepId),
        [steps, activeStepId]
    )

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bereidingswijze</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={api.addStep}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Stap toevoegen
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={steps.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {steps.map((step, index) => (
                        <SortableStep key={step.id} step={step} index={index} api={api} />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeStep ? (
                        <SortableStep
                            step={activeStep}
                            index={steps.findIndex((s) => s.id === activeStepId)}
                            api={api}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {steps.length === 0 && (
                <div className="text-muted-foreground py-8 text-center">
                    <p className="text-sm">Nog geen bereidingsstappen toegevoegd</p>
                    <Button variant="outline" size="sm" onClick={api.addStep} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Eerste stap toevoegen
                    </Button>
                </div>
            )}

            {steps.length > 0 && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={api.addStep}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Stap toevoegen
                    </Button>
                </div>
            )}
        </div>
    )
}

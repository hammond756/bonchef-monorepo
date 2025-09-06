"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { InputWithError } from "@/components/ui/input-with-error"
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { IngredientItem } from "./ingredient-item"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import type {
    UIIngredient,
    UIIngredientGroup,
    IngredientGroupsAPI,
} from "@/hooks/use-ingredient-groups"

interface IngredientGroupManagerProps {
    groups: UIIngredientGroup[]
    isExpanded: boolean[]
    api: IngredientGroupsAPI
    className?: string
}

function SortableGroup({
    group,
    isExpanded,
    api,
}: {
    group: UIIngredientGroup
    isExpanded: boolean
    api: IngredientGroupsAPI
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: group.id,
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
                "bg-card touch-manipulation rounded-lg transition-all select-none",
                isDragging && "z-50 scale-105 opacity-50 shadow-lg"
            )}
        >
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex flex-1 items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className={cn(
                            "flex h-10 w-10 cursor-grab items-center justify-center rounded-md select-none active:cursor-grabbing",
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
                        <GripVertical
                            className="text-muted-foreground h-5 w-5 md:h-4 md:w-4"
                            aria-label={`Sleep hendel voor receptgroep ${group.title}`}
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => api.toggleGroup(group.id)}
                        className="h-auto p-1"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>

                    <InputWithError
                        value={group.title}
                        onChange={(e) => api.updateGroupTitle(group.id, e.target.value)}
                        placeholder="Groep naam"
                        className="h-auto border-none p-0 text-base font-bold focus-visible:ring-0"
                        style={{ userSelect: "text", touchAction: "auto" }}
                        onFocus={(e) => e.stopPropagation()}
                        aria-label="Naam van receptgroep"
                        autoFocus={group.title.trim() === "" || group.title === "Nieuwe groep"}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {group.ingredients.length > 0 ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive h-auto p-1"
                                    aria-label="Verwijder receptgroep"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Groep verwijderen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Deze groep bevat {group.ingredients.length} ingrediënt
                                        {group.ingredients.length === 1 ? "" : "en"}. Weet je zeker
                                        dat je &quot;{group.title}&quot; wilt verwijderen? Alle
                                        ingrediënten in deze groep zullen ook worden verwijderd.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => api.deleteGroup(group.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Verwijderen
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => api.deleteGroup(group.id)}
                            className="text-destructive hover:text-destructive h-auto p-1"
                            aria-label="Verwijder receptgroep"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-3 py-3">
                    {group.ingredients.length > 0 ? (
                        <SortableIngredientList
                            groupId={group.id}
                            ingredients={group.ingredients}
                            api={api}
                        />
                    ) : (
                        <div className="text-muted-foreground py-4 text-center">
                            <p className="text-sm">Nog geen ingrediënten in deze groep</p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => api.addIngredient(group.id)}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Ingrediënt toevoegen
                    </Button>
                </div>
            )}
        </div>
    )
}

function SortableIngredientList({
    groupId,
    ingredients,
    api,
}: {
    groupId: string
    ingredients: UIIngredient[]
    api: IngredientGroupsAPI
}) {
    const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveIngredientId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveIngredientId(null)

        if (over && active.id !== over.id) {
            const oldIndex = ingredients.findIndex((i) => i.id === active.id)
            const newIndex = ingredients.findIndex((i) => i.id === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                api.reorderIngredient(groupId, oldIndex, newIndex)
            }
        }
    }

    const activeIngredient = useMemo(
        () => ingredients.find((i) => i.id === activeIngredientId),
        [ingredients, activeIngredientId]
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={ingredients.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
            >
                {ingredients.map((ingredient, index) => (
                    <IngredientItem
                        key={ingredient.id}
                        ingredient={ingredient}
                        onChange={(updates) =>
                            api.updateIngredient(groupId, ingredient.id, updates)
                        }
                        onDelete={() => api.deleteIngredient(groupId, ingredient.id)}
                        index={index}
                    />
                ))}
            </SortableContext>
            <DragOverlay>
                {activeIngredient ? (
                    <IngredientItem
                        ingredient={activeIngredient}
                        onChange={() => {}}
                        onDelete={() => {}}
                        index={0}
                        className="bg-card shadow-lg"
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

export function IngredientGroupManager({
    groups,
    isExpanded,
    api,
    className,
}: IngredientGroupManagerProps) {
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveGroupId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveGroupId(null)

        if (over && active.id !== over.id) {
            const oldIndex = groups.findIndex((g) => g.id === active.id)
            const newIndex = groups.findIndex((g) => g.id === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                api.reorderGroup(oldIndex, newIndex)
            }
        }
    }

    const activeGroup = useMemo(
        () => groups.find((g) => g.id === activeGroupId),
        [groups, activeGroupId]
    )

    return (
        <div className={cn("space-y-4", className)}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={groups.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {groups.map((group, index) => (
                        <SortableGroup
                            key={group.id}
                            group={group}
                            isExpanded={isExpanded[index]}
                            api={api}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeGroup ? (
                        <SortableGroup
                            group={activeGroup}
                            isExpanded={isExpanded[groups.findIndex((g) => g.id === activeGroupId)]}
                            api={api}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Button variant="outline" onClick={api.addGroup} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Groep toevoegen
            </Button>
        </div>
    )
}

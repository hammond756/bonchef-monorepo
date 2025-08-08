"use client"

import { RecipeImageEditor } from "./recipe-image-editor"
import { InlineEditableTitle } from "./inline-editable-title"
import { CookingTimeInput } from "./cooking-time-input"
import { ServingsInput } from "./servings-input"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { SourceField } from "./source-field"
import { cn } from "@/lib/utils"

interface RecipeInformationSectionProps {
    // Image
    imageUrl?: string | null
    onImageChange?: (file: File) => void
    onGenerateImage?: () => void
    onTakePhoto?: () => void
    isGenerating?: boolean

    // Recipe details
    title: string
    onTitleChange: (title: string) => void

    cookingTime: number
    onCookingTimeChange: (time: number) => void

    servings: number
    onServingsChange: (servings: number) => void

    description: string
    onDescriptionChange: (description: string) => void

    source: string
    onSourceChange: (source: string) => void

    // Validation errors
    errors?: Record<string, string | undefined>

    className?: string
}

export function RecipeInformationSection({
    imageUrl,
    onImageChange,
    onGenerateImage,
    onTakePhoto,
    isGenerating = false,
    title,
    onTitleChange,
    cookingTime,
    onCookingTimeChange,
    servings,
    onServingsChange,
    description,
    onDescriptionChange,
    source,
    onSourceChange,
    errors,
    className,
}: RecipeInformationSectionProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Recipe Image */}
            <RecipeImageEditor
                imageUrl={imageUrl}
                recipeTitle={title}
                onImageChange={onImageChange}
                onGenerateImage={onGenerateImage}
                onTakePhoto={onTakePhoto}
                isGenerating={isGenerating}
                className="mx-auto w-full max-w-md"
            />

            {/* Recipe Title */}
            <InlineEditableTitle
                value={title}
                onChange={onTitleChange}
                placeholder="Recept titel"
                className="w-full"
            />

            {/* Cooking Time and Servings */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CookingTimeInput
                    value={cookingTime}
                    onChange={onCookingTimeChange}
                    className="w-full"
                />
                <ServingsInput value={servings} onChange={onServingsChange} className="w-full" />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Beschrijving</label>
                <AutoResizeTextarea
                    value={description}
                    onChange={onDescriptionChange}
                    placeholder="Schrijf hier op wat jouw recept zo goed maakt!"
                    className="w-full"
                    maxLength={500}
                    minRows={3}
                    maxRows={6}
                    ariaLabel="Recept beschrijving"
                    error={errors?.description}
                />
            </div>

            {/* Source */}
            <SourceField value={source} onChange={onSourceChange} className="w-full" />
        </div>
    )
}

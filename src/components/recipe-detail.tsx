"use client"

import { RecipeRead, GeneratedRecipe } from "@/lib/types"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PencilIcon } from "lucide-react"
import Link from "next/link"

import { User } from "@supabase/supabase-js"
import React from "react"
import { ClaimRecipeButton } from "./claim-recipe-button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppTabsList } from "@/components/ui/app-tabs"

import { InteractiveIngredientsList } from "@/components/interactive-ingredients-list"
import { RecipeInstructions, InstructionStep } from "./recipe-instructions"
import { RecipeActionButtons } from "./recipe/recipe-action-buttons"
import { CommentOverlay } from "@/components/comment-overlay"
import { useState } from "react"
import { createRecipeSlug } from "@/lib/utils"

interface RecipeMetadataProps {
    recipe: RecipeRead
}

function RecipeMetadata({ recipe, user }: RecipeMetadataProps & { user?: User }) {
    return (
        <div className="space-y-2 py-1.5">
            <div className="text-muted-foreground flex items-center justify-end text-sm">
                <EditRecipeButton user={user} ownerId={recipe.user_id} recipeId={recipe.id} />
            </div>
        </div>
    )
}

interface EditRecipeButtonProps {
    user?: User
    ownerId?: string
    recipeId?: string
}

function EditRecipeButton({ user, ownerId, recipeId }: EditRecipeButtonProps) {
    if (!user || !ownerId || !recipeId || user.id !== ownerId) return null

    return (
        <Link
            href={`/edit/${recipeId}`}
            className="bg-status-yellow-bg text-status-yellow-text hover:bg-status-yellow-bg/80 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-colors duration-200 hover:shadow-md"
        >
            <PencilIcon className="h-3.5 w-3.5" />
            <span>Bewerk recept</span>
        </Link>
    )
}

interface BaseRecipeDetailProps {
    variant: "generated" | "saved"
    user?: User
}

interface GeneratedRecipeDetailProps extends BaseRecipeDetailProps {
    variant: "generated"
    recipe: GeneratedRecipe
}

interface SavedRecipeDetailProps extends BaseRecipeDetailProps {
    variant: "saved"
    recipe: RecipeRead
}

type RecipeDetailProps = GeneratedRecipeDetailProps | SavedRecipeDetailProps

export function RecipeDetail({ variant, recipe, user }: RecipeDetailProps) {
    const [isCommentOverlayOpen, setIsCommentOverlayOpen] = useState(false)
    // Log de profiel data om te debuggen
    if (variant === "saved" && recipe.profiles) {
        console.log(
            "[RecipeDetail] Profiles data:",
            JSON.stringify((recipe as RecipeRead).profiles, null, 2)
        )
    } else if (variant === "saved") {
        console.log("[RecipeDetail] Profiles data is missing or undefined.")
    }

    const detailTabs = [
        { value: "ing", label: "Ingrediënten" },
        { value: "ins", label: "Bereiding" },
        { value: "nutr", label: "Voeding" },
    ]

    return (
        <div className="bg-surface">
            <div className="container mx-auto max-w-4xl">
                {variant === "saved" && recipe.thumbnail && (
                    <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden">
                        {recipe.thumbnail && (
                            <Image
                                src={recipe.thumbnail!}
                                alt={recipe.title}
                                fill
                                className="object-cover"
                                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 600px"
                            />
                        )}
                        <div className="from-overlay-dark absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

                        <div className="text-surface absolute right-0 bottom-0 left-0 flex items-end justify-between p-4">
                            <div className="flex flex-col pr-16">
                                <Link
                                    href={`/recipes/${createRecipeSlug(recipe.title, recipe.id)}`}
                                    className="mb-1 block"
                                >
                                    <h1
                                        className="line-clamp-2 text-2xl font-extrabold drop-shadow-lg md:text-4xl"
                                        data-testid="recipe-title"
                                    >
                                        {recipe.title}
                                    </h1>
                                </Link>
                                {recipe.profiles && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Link
                                            href={`/profiles/~${recipe.profiles.id}`}
                                            className="group/profile"
                                        >
                                            <span className="font-medium group-hover/profile:underline">
                                                {recipe.profiles.display_name || "Anonieme chef"}
                                            </span>
                                        </Link>
                                        <span className="text-surface/70">|</span>
                                        <span className="text-surface/70 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {recipe.total_cook_time_minutes} min
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute right-6 bottom-1">
                                <RecipeActionButtons
                                    recipe={recipe}
                                    theme="light"
                                    shareButtonSize="md"
                                    bookmarkButtonSize="md"
                                    avatarSize="lg"
                                    onCommentClick={() => setIsCommentOverlayOpen(true)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-4">
                    {variant === "saved" && (
                        <ClaimRecipeButton
                            user={user}
                            ownerId={recipe.user_id}
                            recipeId={recipe.id}
                        />
                    )}

                    {(variant !== "saved" || !recipe.thumbnail) && (
                        <div className="container mx-auto max-w-4xl px-4">
                            <h1
                                className="text-default pb-4 text-3xl font-bold"
                                data-testid="recipe-title"
                            >
                                {recipe.title}
                            </h1>
                        </div>
                    )}

                    <div className="container mx-auto max-w-4xl px-4">
                        {variant === "saved" && <RecipeMetadata recipe={recipe} user={user} />}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Tabs defaultValue="ing">
                    <div className="border-border border-b">
                        <div className="container mx-auto max-w-4xl">
                            <AppTabsList tabs={detailTabs} />
                        </div>
                    </div>

                    <TabsContent value="ing" className="pt-6">
                        <div className="container mx-auto max-w-4xl px-4">
                            <InteractiveIngredientsList
                                ingredientGroups={recipe.ingredients || []}
                                initialServings={recipe.n_portions || 1}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="ins" className="pt-6">
                        <div className="container mx-auto max-w-4xl px-4">
                            <RecipeInstructions
                                instructions={((recipe.instructions as string[]) || []).map(
                                    (text, index): InstructionStep => ({
                                        id: `instr-${index}-${variant === "saved" ? recipe.id : "generated"}`,
                                        text,
                                    })
                                )}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="nutr" className="pt-6">
                        <div className="container mx-auto max-w-4xl px-4">
                            <Card className="rounded-lg py-6">
                                <p className="text-muted-foreground text-center italic">
                                    Voedingswaarden zijn nog niet beschikbaar voor dit recept.
                                </p>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {variant === "saved" &&
                recipe.source_name &&
                recipe.source_name !== "BonChef" &&
                recipe.source_url &&
                recipe.source_url !== "https://app.bonchef.io" && (
                    <div className="py-8 text-center text-xs">
                        <span className="text-text-default">Bron: </span>
                        <a
                            data-testid="recipe-source-link"
                            href={recipe.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-new hover:text-primary underline"
                        >
                            {recipe.source_name}
                        </a>
                    </div>
                )}

            {variant === "saved" && (
                <CommentOverlay
                    isOpen={isCommentOverlayOpen}
                    onClose={() => setIsCommentOverlayOpen(false)}
                    recipe={recipe as RecipeRead}
                />
            )}
        </div>
    )
}

import { RecipeRead, GeneratedRecipe } from "@/lib/types"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { parseDescription } from "@/lib/utils"
import { User } from "@supabase/supabase-js"
import { LikeButton } from "./like-button"
import React from "react"
import { ClaimRecipeButton } from "./claim-recipe-button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppTabsList } from "@/components/ui/app-tabs"
import { ProfileImage } from "@/components/ui/profile-image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { InteractiveIngredientsList } from "@/components/interactive-ingredients-list"
import { RecipeInstructions, InstructionStep } from "./recipe-instructions"
import { ShareRecipeButton } from "./share-recipe-button"

interface RecipeMetadataProps {
    recipe: RecipeRead
}

function RecipeMetadata({ recipe, user }: RecipeMetadataProps & { user?: User }) {
    return (
        <div className="space-y-2 px-4 py-1.5">
            <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-5 w-5" />
                    <span>{recipe.total_cook_time_minutes} min</span>
                </div>

                <EditRecipeButton user={user} ownerId={recipe.user_id} recipeId={recipe.id} />
            </div>

            {recipe.description && (
                <div className="prose prose-sm max-w-none pt-1.5 text-gray-600">
                    {parseDescription(recipe.description).map((part, index) => {
                        if (part.type === "url") {
                            return (
                                <a
                                    key={index}
                                    href={part.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline hover:text-blue-700"
                                >
                                    {part.content}
                                </a>
                            )
                        }
                        return <React.Fragment key={index}>{part.content}</React.Fragment>
                    })}
                </div>
            )}
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
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 shadow-sm transition-colors duration-200 hover:bg-amber-200 hover:shadow-md"
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
        <>
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between p-4 text-white">
                            <div className="flex flex-col pr-16">
                                <Link href={`/recipes/${recipe.id}`} className="mb-1 block">
                                    <h1
                                        className="line-clamp-2 text-2xl font-extrabold drop-shadow-lg md:text-4xl"
                                        data-testid="recipe-title"
                                    >
                                        {recipe.title}
                                    </h1>
                                </Link>
                                {recipe.profiles && (
                                    <Link
                                        href={`/profiles/~${recipe.profiles.id}`}
                                        className="group/profile block text-xs"
                                    >
                                        <span className="font-medium group-hover/profile:underline">
                                            {recipe.profiles.display_name || "Anonieme chef"}
                                        </span>
                                        {recipe.created_at && (
                                            <>
                                                <span className="group-hover/profile:text-primary mx-2 text-xs text-gray-300 transition-colors">
                                                    |
                                                </span>
                                                <span className="group-hover/profile:text-primary text-xs text-gray-300 transition-colors">
                                                    {format(
                                                        new Date(
                                                            (recipe as RecipeRead).created_at!
                                                        ),
                                                        "d MMM yyyy",
                                                        { locale: nl }
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </Link>
                                )}
                            </div>
                            <div className="absolute right-4 bottom-4 flex flex-col items-center space-y-2">
                                <ShareRecipeButton
                                    title={recipe.title}
                                    text={`Bekijk dit recept: ${recipe.title}`}
                                />
                                {user && recipe.id && (
                                    <LikeButton
                                        buttonSize="md"
                                        recipeId={recipe.id!}
                                        initialLiked={recipe.is_liked_by_current_user}
                                        initialLikeCount={recipe.like_count || 0}
                                    />
                                )}
                                {recipe.profiles && (
                                    <Link
                                        href={`/profiles/~${recipe.profiles.id}`}
                                        className="group/profile flex h-12 w-12 items-center justify-center rounded-full bg-white/80 transition-colors duration-200 hover:bg-white/95"
                                    >
                                        <ProfileImage
                                            src={recipe.profiles.avatar}
                                            name={recipe.profiles.display_name || "Anonieme chef"}
                                            size={46}
                                            className="group-hover/profile:border-primary border-2 border-transparent transition-colors"
                                        />
                                    </Link>
                                )}
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
                        <h1
                            className="pb-4 text-3xl font-bold text-gray-900"
                            data-testid="recipe-title"
                        >
                            {" "}
                            {/* px-4 hier verwijderd, pb-4 blijft */}
                            {recipe.title}
                        </h1>
                    )}

                    {variant === "saved" && <RecipeMetadata recipe={recipe} user={user} />}

                    <div className="mt-8">
                        <Tabs
                            defaultValue="ing"
                            // className for Tabs root can be added here if needed
                        >
                            <AppTabsList
                                tabs={detailTabs}
                                // tabsListClassName="bg-green-50" // This prop is now removed
                            />

                            {/* TabsContent needs to be managed here, outside AppTabs */}
                            <TabsContent value="ing" className="pt-6">
                                <InteractiveIngredientsList
                                    ingredientGroups={recipe.ingredients || []}
                                    initialServings={recipe.n_portions || 1}
                                />
                            </TabsContent>
                            <TabsContent value="ins" className="pt-6">
                                <RecipeInstructions
                                    instructions={((recipe.instructions as string[]) || []).map(
                                        (text, index): InstructionStep => ({
                                            id: `instr-${index}-${variant === "saved" ? recipe.id : "generated"}`,
                                            text,
                                        })
                                    )}
                                />
                            </TabsContent>
                            <TabsContent value="nutr" className="pt-6">
                                <Card className="rounded-lg py-6">
                                    <p className="text-center text-gray-400 italic">
                                        Deze functionaliteit komt spoedig.
                                    </p>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {variant === "saved" &&
                        recipe.source_name &&
                        recipe.source_name !== "BonChef" &&
                        recipe.source_url &&
                        recipe.source_url !== "https://app.bonchef.io" && (
                            <div className="py-8 text-center text-xs text-gray-500">
                                <span>Bron: </span>
                                <a
                                    data-testid="recipe-source-link"
                                    href={recipe.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline hover:text-blue-700"
                                >
                                    {recipe.source_name}
                                </a>
                            </div>
                        )}
                </div>
            </div>
        </>
    )
}

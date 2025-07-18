"use client"

import { Recipe, RecipeImportJob } from "@/lib/types"
import Link from "next/link"
import { LikeButton } from "@/components/like-button"
import { Badge } from "@/components/ui/badge"
import { Loader2, LinkIcon, TextIcon } from "lucide-react"
import { getHostnameFromUrl, cn } from "@/lib/utils"
import Image from "next/image"

function RecipeCardTitle({ title, subTitle }: { title: string; subTitle?: string }) {
    return (
        <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-surface line-clamp-2 text-base font-bold">{title}</h3>
            {subTitle && <p className="text-xs text-slate-200">{subTitle}</p>}
        </div>
    )
}

function RecipeCardContainer({ children, href }: { children: React.ReactNode; href?: string }) {
    return (
        <Link
            href={href || "#"}
            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-lg"
        >
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            {children}
        </Link>
    )
}

export function RecipeCard({ recipe }: { readonly recipe: Recipe }) {
    const isDraft = recipe.status === "DRAFT"
    const shouldBlur = isDraft
    const href = isDraft ? `/edit/${recipe.id}` : `/recipes/${recipe.id}`

    return (
        <RecipeCardContainer href={href}>
            <RecipeCardTitle title={recipe.title} />

            {isDraft && (
                <div className="absolute top-2 left-2 z-10">
                    <Badge variant="yellow">Concept</Badge>
                </div>
            )}

            <div
                style={{ backgroundImage: `url(${recipe.thumbnail})` }}
                className={cn(
                    "h-full w-full bg-cover bg-center transition-transform duration-300 [color-rendering:optimizeSpeed] group-hover:scale-105",
                    shouldBlur && "blur-sm"
                )}
            />

            <div className="absolute top-2 right-2">
                <LikeButton
                    recipeId={recipe.id}
                    initialLiked={!!recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count || 0}
                    showCount={false}
                    theme="dark"
                />
            </div>
        </RecipeCardContainer>
    )
}

export function InProgressRecipeCard({ job }: { readonly job: RecipeImportJob }) {
    const renderSourceContent = () => {
        switch (job.source_type) {
            case "image":
                return (
                    <>
                        <Image
                            src={job.source_data}
                            alt="Bezig met importeren van afbeelding"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    </>
                )
            case "url":
                return (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center">
                        <LinkIcon className="h-10 w-10 text-slate-400" />
                        <p className="text-sm font-medium break-all text-slate-600">
                            {getHostnameFromUrl(job.source_data)}
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    </div>
                )
            case "text":
                return (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-4">
                        <TextIcon className="h-10 w-10 text-slate-400" />
                        <p className="line-clamp-4 text-sm text-slate-600 italic">
                            {`"${job.source_data}"`}
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <RecipeCardContainer>
            {renderSourceContent()}
            <RecipeCardTitle title="Recept wordt gemaakt..." />
        </RecipeCardContainer>
    )
}

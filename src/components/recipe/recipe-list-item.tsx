import { RecipeImportJob, RecipeRead } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import { LikeButton } from "@/components/like-button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, LinkIcon, Loader2, TextIcon } from "lucide-react"
import { getHostnameFromUrl } from "@/lib/utils"

export function RecipeListItem({ recipe }: { readonly recipe: RecipeRead }) {
    const isDraft = recipe.status === "DRAFT"
    const href = isDraft ? `/edit/${recipe.id}` : `/recipes/${recipe.id}`

    return (
        <div className="group border-border bg-surface relative flex items-center gap-4 rounded-xl border p-2 shadow-sm">
            <Link href={href} className="flex flex-1 items-center gap-4">
                <div className="relative aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={recipe.thumbnail}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                    />
                    {isDraft && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Badge
                                variant="secondary"
                                className="bg-status-yellow-bg text-status-yellow-text"
                            >
                                Concept
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-default line-clamp-2 font-semibold group-hover:underline">
                        {recipe.title}
                    </h2>
                </div>
            </Link>
            <div className="pr-2">
                <LikeButton
                    recipeId={recipe.id}
                    initialLiked={!!recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count || 0}
                    showCount={false}
                />
            </div>
        </div>
    )
}

export function InProgressRecipeListItem({ job }: { readonly job: RecipeImportJob }) {
    const renderSourceIcon = () => {
        switch (job.source_type) {
            case "image":
                return (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        <ImageIcon className="h-8 w-8 text-slate-500" />
                    </div>
                )
            case "url":
                return (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        <LinkIcon className="h-8 w-8 text-slate-500" />
                    </div>
                )
            case "text":
                return (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        <TextIcon className="h-8 w-8 text-slate-500" />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="border-border bg-surface relative flex items-center gap-4 rounded-xl border p-2 shadow-sm">
            {renderSourceIcon()}
            <div className="flex-1">
                <h2 className="text-default font-semibold">Recept wordt gemaakt...</h2>
                <p className="line-clamp-1 text-sm text-slate-500">
                    {job.source_type === "url"
                        ? getHostnameFromUrl(job.source_data)
                        : job.source_data}
                </p>
            </div>
            <div className="mr-2 pr-2">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        </div>
    )
}

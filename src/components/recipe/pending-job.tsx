"use client"

import { RecipeImportJob } from "@/lib/types"
import { Loader2, LinkIcon, TextIcon } from "lucide-react"
import { getHostnameFromUrl } from "@/lib/utils"
import Image from "next/image"
import { RecipeCardContainer, RecipeCardTitle } from "./recipe-card"

export function PendingJob({ job }: { readonly job: RecipeImportJob }) {
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

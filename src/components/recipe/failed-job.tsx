"use client"

import { RecipeImportJob } from "@/lib/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"

export function FailedJob({ job }: { readonly job: RecipeImportJob }) {
    const { isDeleting, removeJob } = useRecipeImportJobs()

    const handleAttemptDelete = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        e.stopPropagation()
        removeJob(job.id)
    }

    const jobIsBeingDeleted = isDeleting === job.id

    return (
        <div className="group relative block aspect-[3/4] w-full overflow-hidden rounded-lg">
            <div className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-red-50 p-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <div className="space-y-2">
                    <p className="text-sm font-medium text-red-700">Import mislukt</p>
                    {job.error_message && (
                        <p className="text-xs leading-relaxed text-red-600">{job.error_message}</p>
                    )}
                    <button
                        type="button"
                        disabled={jobIsBeingDeleted}
                        onTouchEnd={handleAttemptDelete}
                        onClick={handleAttemptDelete}
                        className="absolute top-2 right-2 z-20 flex h-8 w-8 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:bg-red-400"
                        data-testid="delete-import-button"
                        style={{
                            pointerEvents: "auto",
                            WebkitTapHighlightColor: "transparent",
                            touchAction: "manipulation",
                        }}
                        tabIndex={0}
                        aria-label="Verwijder import"
                    >
                        {jobIsBeingDeleted ? <Loader2 className="h-4 w-4 animate-spin" /> : "×"}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 z-10 p-4">
                <h3
                    className="text-surface line-clamp-2 text-base font-bold"
                    aria-label="Import mislukt"
                >
                    Import mislukt
                </h3>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { GeneratedRecipe } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { patchMessagePayload } from "@/app/actions"
import { useRecipeGeneration } from "@/hooks/use-recipe-generation"
import { RecipeModal } from "./recipe-modal"

interface RecipeTeaserCardProps {
    content: string
    messageId: string | null
    initialRecipe?: GeneratedRecipe
}

export function RecipeTeaserCard({ content, messageId, initialRecipe }: RecipeTeaserCardProps) {
    const [recipe, setRecipe] = useState<GeneratedRecipe | null>(initialRecipe || null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { generateRecipe, isStreaming, hasError, error } = useRecipeGeneration({
        onStreaming: (generatedRecipe) => {
            setRecipe(generatedRecipe)
        },
        onComplete: (generatedRecipe) => {
            if (messageId) {
                patchMessagePayload(messageId, { recipe: generatedRecipe })
            }
        },
    })

    const handleTeaserClick = async () => {
        setIsModalOpen(true)
        await generateRecipe(content)
    }

    return (
        <>
            <Card
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${!messageId ? "cursor-not-allowed opacity-50" : "hover:shadow-lg"}`}
                onClick={messageId ? handleTeaserClick : undefined}
                data-testid="teaser-card"
            >
                {isStreaming && (
                    <div className="animate-sheen pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-gray-200/20 to-transparent" />
                )}
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="prose prose-sm text-p font-montserrat max-w-none">
                            <ReactMarkdown
                                rehypePlugins={[rehypeSanitize]}
                                components={{
                                    a: ({ ...props }) => (
                                        <a
                                            {...props}
                                            className="text-accent-new hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                    ol: ({ ...props }) => (
                                        <ol {...props} className="list-decimal pl-4" />
                                    ),
                                    ul: ({ ...props }) => (
                                        <ul {...props} className="list-disc pl-4" />
                                    ),
                                    p: ({ ...props }) => (
                                        <p {...props} className="py-1 whitespace-pre-wrap" />
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-muted-foreground text-small">
                                {isStreaming
                                    ? "Recept laden..."
                                    : recipe
                                      ? "Klik om het recept te bekijken"
                                      : "Zal ik het recept voor je uitschrijven?"}
                            </p>
                            <div className="flex items-center">
                                {isStreaming ? (
                                    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                                ) : (
                                    <ChevronRight
                                        className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                                            !messageId
                                                ? "text-muted-foreground/30"
                                                : "text-muted-foreground"
                                        }`}
                                    />
                                )}
                            </div>
                        </div>
                        {hasError && <p className="text-status-red-text mt-1 text-sm">{error}</p>}
                    </div>
                </CardContent>
            </Card>
            <RecipeModal
                recipe={recipe}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                canSave={!isStreaming && !hasError}
            />
        </>
    )
}

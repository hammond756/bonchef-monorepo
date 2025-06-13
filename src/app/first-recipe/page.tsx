"use client"

import { useState } from "react"
import { ImageIcon, LinkIcon, TextIcon } from "lucide-react"
import { UrlDialog } from "@/components/url-dialog"
import { ImageDialog } from "@/components/image-dialog"
import { TextDialog } from "@/components/text-dialog"
import { ImportButton } from "@/components/import-button"
import {
    generateRecipeFromImage,
    generateRecipeFromSnippet,
    createDraftRecipe,
} from "@/actions/recipe-imports"
import { scrapeRecipe } from "@/actions/recipe-imports"
import { useRouter } from "next/navigation"

export default function FirstRecipePage() {
    const [openDialog, setOpenDialog] = useState<null | "url" | "image" | "text">(null)
    const router = useRouter()

    const submitUrl = async (validFormData: { url: string }) => {
        const recipe = await scrapeRecipe(validFormData.url)
        const { id } = await createDraftRecipe(
            { ...recipe, thumbnail: recipe.thumbnail },
            { isPublic: true }
        )
        router.push(`/edit/${id}`)
    }

    const submitImage = async (validFormData: { imageUrl: string }) => {
        const recipe = await generateRecipeFromImage(validFormData.imageUrl)
        const { id } = await createDraftRecipe(recipe, { isPublic: true })
        router.push(`/edit/${id}`)
    }

    const submitText = async (validFormData: { text: string }) => {
        const recipe = await generateRecipeFromSnippet(validFormData.text)
        const { id } = await createDraftRecipe(recipe, { isPublic: true })
        router.push(`/edit/${id}`)
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
                <p className="text-center text-lg text-slate-700">
                    Recepten toevoegen kan op drie manieren, zodat jouw hele collectie bij bonchef
                    onder de pannen kunnen
                </p>
                <div className="flex w-full flex-col gap-4">
                    <ImportButton
                        className="bg-white"
                        onClick={() => setOpenDialog("url")}
                        icon={<LinkIcon className="h-6 w-6 text-slate-600" />}
                        backgroundColor="bg-slate-100"
                        title="Site scannen"
                        description="Plak een link naar een online recept"
                    />
                    <ImportButton
                        className="bg-white"
                        onClick={() => setOpenDialog("image")}
                        icon={<ImageIcon className="h-6 w-6 text-purple-600" />}
                        backgroundColor="bg-purple-100"
                        title="Kookboek scannen"
                        description="Maak een foto van een kookboek"
                    />
                    <ImportButton
                        className="bg-white"
                        onClick={() => setOpenDialog("text")}
                        icon={<TextIcon className="h-6 w-6 text-blue-600" />}
                        backgroundColor="bg-blue-100"
                        title="Tekst invoeren"
                        description="Kopieer een tekst uit je notities"
                    />
                </div>
            </div>
            <UrlDialog
                open={openDialog === "url"}
                onOpenChange={() => setOpenDialog(null)}
                onSubmit={submitUrl}
            />
            <ImageDialog
                open={openDialog === "image"}
                onOpenChange={() => setOpenDialog(null)}
                onSubmit={submitImage}
            />
            <TextDialog
                open={openDialog === "text"}
                onOpenChange={() => setOpenDialog(null)}
                onSubmit={submitText}
            />
        </div>
    )
}

"use client"

import { createClient } from "@/utils/supabase/client"
import { redirect, useRouter } from "next/navigation"
import { ImageIcon, LinkIcon, TextIcon } from "lucide-react"
import { ImportButton } from "@/components/import-button"
import { useEffect, useState } from "react"
import { UrlDialog } from "@/components/url-dialog"
import { ImageDialog } from "@/components/image-dialog"
import { TextDialog } from "@/components/text-dialog"
import { generateRecipeFromImage, generateRecipeFromSnippet } from "@/actions/recipe-imports"
import { saveRecipe, scrapeRecipe } from "@/actions/recipe-imports"

export default function ImportPage() {
  const supabase = createClient()
  const [openDialog, setOpenDialog] = useState<null | "url" | "image" | "text">(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (!user) {
        redirect("/welcome")
      }
    }
    checkAuth()
  }, [supabase])

  const submitUrl = async (validFormData: { url: string }) => {
    const recipe = await scrapeRecipe(validFormData.url);
    const { id } = await saveRecipe({ ...recipe, thumbnail: recipe.thumbnail });
    router.push(`/recipes/${id}`);
  }

  const submitImage = async (validFormData: { imageUrl: string }) => {
    const recipe = await generateRecipeFromImage(validFormData.imageUrl);
    const { id } = await saveRecipe(recipe);
    router.push(`/recipes/${id}`);
  }

  const submitText = async (validFormData: { text: string }) => {
    const recipe = await generateRecipeFromSnippet(validFormData.text);
    const { id } = await saveRecipe(recipe);
    router.push(`/recipes/${id}`);
  }

  return (
    <>
    <div className="px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Importeer een recept</h1>
    </div>
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <ImportButton
          onClick={() => setOpenDialog("url")} icon={<LinkIcon className="w-6 h-6 text-slate-600" />} backgroundColor="bg-slate-100" title="Recepten website" description="Plak een link uit de browser in de chat" />
        <ImportButton
          onClick={() => setOpenDialog("image")} icon={<ImageIcon className="w-6 h-6 text-purple-600" />} backgroundColor="bg-purple-100" title="Kookboek foto" description="Maak een foto van een kookboek" />
        <ImportButton
          onClick={() => setOpenDialog("text")} icon={<TextIcon className="w-6 h-6 text-blue-600" />} backgroundColor="bg-blue-100" title="Plak of schrijf tekst" description="Kopieer een tekst uit je notities" />
      </div>
      <UrlDialog open={openDialog === "url"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitUrl} />
      <ImageDialog open={openDialog === "image"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitImage} />
      <TextDialog open={openDialog === "text"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitText} />
    </div>
    </>
  )
}

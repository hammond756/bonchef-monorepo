"use client"

import { useState } from "react"
import { ImageIcon, LinkIcon, TextIcon } from "lucide-react"
import { UrlDialog } from "@/components/url-dialog";
import { ImageDialog } from "@/components/image-dialog";
import { TextDialog } from "@/components/text-dialog";
import { ImportButton } from "@/components/import-button"
import { generateRecipeFromImage, generateRecipeFromSnippet, saveMarketingRecipe } from "@/actions/recipe-imports";
import { scrapeRecipe } from "@/actions/recipe-imports";
import { useRouter } from "next/navigation";

export default function FirstRecipePage() {
  const [openDialog, setOpenDialog] = useState<null | "url" | "image" | "text">(null)
  const router = useRouter()

  const submitUrl = async (validFormData: { url: string }) => {
    const recipe = await scrapeRecipe(validFormData.url);
    const { id } = await saveMarketingRecipe({ ...recipe, thumbnail: recipe.thumbnail });
    router.push(`/recipes/${id}`);
  }

  const submitImage = async (validFormData: { imageUrl: string }) => {
    const recipe = await generateRecipeFromImage(validFormData.imageUrl);
    const { id } = await saveMarketingRecipe(recipe);
    router.push(`/recipes/${id}`);
  }

  const submitText = async (validFormData: { text: string }) => {
    const recipe = await generateRecipeFromSnippet(validFormData.text);
    const { id } = await saveMarketingRecipe(recipe);
    router.push(`/recipes/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 bg-white border border-slate-200 rounded-xl shadow-lg p-8 max-w-md w-full">
        <p className="text-lg text-center text-slate-700">
          Recepten toevoegen kan op drie manieren, zodat jouw hele collectie bij bonchef onder de pannen kunnen
        </p>
        <div className="flex flex-col gap-4 w-full">
          <ImportButton
            onClick={() => setOpenDialog("url")} icon={<LinkIcon className="w-6 h-6 text-slate-600" />} backgroundColor="bg-slate-100" title="Recepten website" description="Plak een link uit de browser in de chat" />
          <ImportButton
            onClick={() => setOpenDialog("image")} icon={<ImageIcon className="w-6 h-6 text-purple-600" />} backgroundColor="bg-purple-100" title="Kookboek foto" description="Maak een foto van een kookboek" />
          <ImportButton
            onClick={() => setOpenDialog("text")} icon={<TextIcon className="w-6 h-6 text-blue-600" />} backgroundColor="bg-blue-100" title="Plak of schrijf tekst" description="Kopieer een tekst uit je notities" />
        </div>
      </div>
      <UrlDialog open={openDialog === "url"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitUrl} />
      <ImageDialog open={openDialog === "image"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitImage} />
      <TextDialog open={openDialog === "text"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitText} />
    </div>
  )
}

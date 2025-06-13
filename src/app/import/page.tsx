"use client"

import { createClient } from "@/utils/supabase/client"
import { redirect, useRouter } from "next/navigation"
import { ImageIcon, LinkIcon, MessageSquarePlus, TextIcon } from "lucide-react"
import { ImportButton } from "@/components/import-button"
import { useEffect, useState } from "react"
import { UrlDialog } from "@/components/url-dialog"
import { ImageDialog } from "@/components/image-dialog"
import { TextDialog } from "@/components/text-dialog"
import { generateRecipeFromImage, generateRecipeFromSnippet, createDraftRecipe } from "@/actions/recipe-imports"
import { scrapeRecipe } from "@/actions/recipe-imports"
import { useChatStore } from "@/lib/store/chat-store"

export default function ImportPage() {
  const supabase = createClient()
  const [openDialog, setOpenDialog] = useState<null | "url" | "image" | "text">(null)
  const router = useRouter()
  const { clearConversation } = useChatStore()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        redirect("/welcome")
      }
    }
    checkAuth()
  }, [supabase])

  const submitUrl = async (validFormData: { url: string }) => {
    const recipe = await scrapeRecipe(validFormData.url);
    const { id } = await createDraftRecipe({ ...recipe, thumbnail: recipe.thumbnail });
    router.push(`/edit/${id}`);
  }

  const submitImage = async (validFormData: { imageUrl: string }) => {
    const recipe = await generateRecipeFromImage(validFormData.imageUrl);
    const { id } = await createDraftRecipe(recipe);
    router.push(`/edit/${id}`);
  }

  const submitText = async (validFormData: { text: string }) => {
    const recipe = await generateRecipeFromSnippet(validFormData.text);
    const { id } = await createDraftRecipe(recipe);
    router.push(`/edit/${id}`);
  }

  const handleNewChat = () => {
    clearConversation()
    router.push("/chat")
  }

  return (
    <div className="flex flex-1 flex-col px-4 space-y-4 pt-4">
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Importeer een recept</h1>
        <div className="flex flex-col items-center justify-center gap-4">
          <ImportButton
            className="bg-white"
            onClick={() => setOpenDialog("url")} icon={<LinkIcon className="w-6 h-6 text-slate-600" />} backgroundColor="bg-slate-100" title="Site scannen" description="Plak een link naar een online recept" />
          <ImportButton
            className="bg-white"
            onClick={() => setOpenDialog("image")} icon={<ImageIcon className="w-6 h-6 text-purple-600" />} backgroundColor="bg-purple-100" title="Kookboek scannen" description="Maak een foto van een kookboek" />
          <ImportButton
            className="bg-white"
            onClick={() => setOpenDialog("text")} icon={<TextIcon className="w-6 h-6 text-blue-600" />} backgroundColor="bg-blue-100" title="Tekst invoeren" description="Kopieer een tekst uit je notities" />
          <ImportButton
            className="bg-white"
            onClick={() => handleNewChat()} icon={<MessageSquarePlus className="w-6 h-6 text-green-600" />} backgroundColor="bg-green-100" title="Nieuw recept maken" description="Chat met AI om een recept te maken" />
        </div>
        <UrlDialog open={openDialog === "url"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitUrl} />
        <ImageDialog open={openDialog === "image"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitImage} />
        <TextDialog open={openDialog === "text"} onOpenChange={() => setOpenDialog(null)} onSubmit={submitText} />
      </div>
    </div>
  )
}

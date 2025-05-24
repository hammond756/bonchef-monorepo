"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { scrapeRecipe, saveMarketingRecipe, uploadImage, generateRecipeFromSnippet, generateRecipeFromImage, getSignedUploadUrl } from "./actions"
import { ProgressModal } from "./progress-modal"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { useFileUpload } from "@/hooks/use-file-upload"
import Image from "next/image"
import { X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { StorageService } from "@/lib/services/storage-service"
import { v4 as uuidv4 } from 'uuid';


function UrlForm({ setOpen }: { setOpen: (v: null) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // TODO: make a list of example urls, that can only be used once
  function setExampleUrl() {
    const url = "https://thefoodietakesflight.com/stuffed-miso-butter-mushrooms/#recipe"

    if (!formRef.current) {
      return
    }

    const input: HTMLInputElement | null = formRef.current.querySelector("input[name='url']")

    if (input) {
      input.value = url
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    const url = formData.get("url") as string
    if (!url) {
      setError("Voer een geldige URL in.")
      setIsLoading(false)
      return
    }
    try {
      const recipe = await scrapeRecipe(url)
      const { id } = await saveMarketingRecipe({...recipe, thumbnail: recipe.thumbnail})
      router.push(`/recipes/${id}`)
    } catch (e) {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
      setIsLoading(false)
    }
  }

  const progressSteps = [
    "📖 Recept lezen...",
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "📸 Foto uitzoeken...",
    "✨ Een moment geduld..."
  ];

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit} ref={formRef}>
        <Input id="url" name="url" type="url" placeholder="Plak hier de URL" required />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={setExampleUrl}>Kies voor mij</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </Button>
        </div>
      </form>
      {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
    </>
  )
}

function ImageForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { file, handleChange, handleRemove, preview, fileInputRef } = useFileUpload({ initialFilePath: null })

  async function uploadImageToSignedUrl(file: File): Promise<string> {
    const supabase = await createClient()
    const filePath = `${uuidv4()}.${file.name.split(".").pop()}`
    const { signedUrl, path, token } = await getSignedUploadUrl(filePath)
    const storageService = new StorageService(supabase)
    return await storageService.uploadToSignedUrl("recipe-images", path, file, token)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    if (!file) {
      setError("Geen bestand geselecteerd")
      setIsLoading(false)
      return
    }
    try {
      const imageUrl = await uploadImageToSignedUrl(file)
      const recipe = await generateRecipeFromImage(imageUrl)
      const { id } = await saveMarketingRecipe(recipe)
      router.push(`/recipes/${id}`)
    } catch (e) {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
      setIsLoading(false)
    }
  }

  const progressSteps = [
    "📸 Foto uploaden...",
    "🧠 Inhoud herkennen...",
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "✨ Een moment geduld..."
  ];

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input 
            id="image" 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleChange}
          />
          {preview && (
            <div className="relative w-full max-w-[200px]">
              <Image
                src={preview}
                alt="Recipe image preview"
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </Button>
        </div>
      </form>
      {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
    </>
  )
}

function TextForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    const text = formData.get("text") as string
    if (!text) {
      setError("Voer een geldige tekst in.")
      setIsLoading(false)
      return
    }
    try {
      const recipe = await generateRecipeFromSnippet(text)
      const { id } = await saveMarketingRecipe(recipe)
      router.push(`/recipes/${id}`)
    } catch (e) {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
      setIsLoading(false)
    }
  }

  const progressSteps = [
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "📸 Foto maken...",
    "🍚 Porties berekenen...",
    "✨ Een moment geduld..."
  ];


  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea id="text" name="text" placeholder="Plak hier je recepttekst" className="min-h-[100px]" />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </Button>
        </div>
      </form>
      {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
    </>
  )
}

export default function FirstRecipePage() {
  const [open, setOpen] = useState<null | "url" | "image" | "text">(null)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="flex flex-col items-center gap-6 bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <p className="text-lg text-center text-slate-700">
          Recepten toevoegen kan op drie manieren, zodat jouw hele collectie bij bonchef onder de pannen kunnen
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Button variant="outline" onClick={() => setOpen("url")}>Voeg toe via blogpost link</Button>
          <Button variant="outline" onClick={() => setOpen("image")}>Upload foto van kookboek</Button>
          <Button variant="outline" onClick={() => setOpen("text")}>Plak tekst uit notities of WhatsApp</Button>
        </div>
      </div>
      <Dialog open={open === "url"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg toe via blogpost link</DialogTitle>
          </DialogHeader>
          <UrlForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
      <Dialog open={open === "image"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload foto van kookboek</DialogTitle>
          </DialogHeader>
          <ImageForm />
        </DialogContent>
      </Dialog>
      <Dialog open={open === "text"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plak tekst uit notities of WhatsApp</DialogTitle>
          </DialogHeader>
          <TextForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}

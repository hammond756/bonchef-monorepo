"use client"

import { createClient } from "@/utils/supabase/client"
import { redirect, useRouter } from "next/navigation"
import { ImageIcon, LinkIcon, MessageSquarePlus, TextIcon } from "lucide-react"
import { ImportButton } from "@/components/import-button"
import { useEffect, useState } from "react"
import { UrlDialog } from "@/components/url-dialog"
import { ImageDialog } from "@/components/image-dialog"
import { TextDialog } from "@/components/text-dialog"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { useChatStore } from "@/lib/store/chat-store"

export default function ImportPage() {
    const supabase = createClient()
    const [openDialog, setOpenDialog] = useState<null | "url" | "image" | "text">(null)
    const router = useRouter()
    const { clearConversation } = useChatStore()

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                redirect("/welcome")
            }
        }
        checkAuth()
    }, [supabase])

    const submitUrl = async (validFormData: { url: string }) => {
        await startRecipeImportJob("url", validFormData.url)
        router.push("/collection")
    }

    const submitImage = async (validFormData: { imageUrl: string }) => {
        await startRecipeImportJob("image", validFormData.imageUrl)
        router.push("/collection")
    }

    const submitText = async (validFormData: { text: string }) => {
        await startRecipeImportJob("text", validFormData.text)
        router.push("/collection")
    }

    const handleNewChat = () => {
        clearConversation()
        router.push("/chat")
    }

    return (
        <div className="flex flex-1 flex-col space-y-4 px-4 pt-4">
            <div className="flex flex-col items-center justify-center p-4">
                <h1 className="mb-4 text-2xl font-bold">Importeer een recept</h1>
                <div className="flex flex-col items-center justify-center gap-4">
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
                    <ImportButton
                        className="bg-white"
                        onClick={() => handleNewChat()}
                        icon={<MessageSquarePlus className="h-6 w-6 text-green-600" />}
                        backgroundColor="bg-green-100"
                        title="Nieuw recept maken"
                        description="Chat met AI om een recept te maken"
                    />
                </div>
                <UrlDialog
                    open={openDialog === "url"}
                    onOpenChange={() => setOpenDialog(null)}
                    onSubmit={submitUrl}
                    showProgressAnimation={false}
                />
                <ImageDialog
                    open={openDialog === "image"}
                    onOpenChange={() => setOpenDialog(null)}
                    onSubmit={submitImage}
                    showProgressAnimation={false}
                />
                <TextDialog
                    open={openDialog === "text"}
                    onOpenChange={() => setOpenDialog(null)}
                    onSubmit={submitText}
                    showProgressAnimation={false}
                />
            </div>
        </div>
    )
}

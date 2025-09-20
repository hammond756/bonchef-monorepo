"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImportButton } from "@/components/import-button"
import { Camera, Link as LinkIcon, PenSquare } from "lucide-react"
import { PhotoImportView } from "@/components/import/photo-import-view"
import { UrlImportPopup } from "@/components/import/url-import-popup"
import { TextImportPopup } from "@/components/import/text-import-popup"

interface AddRecipeScreenProps {
    onImportStarted: () => void
    onSkip: () => void
}

const importOptions = [
    {
        icon: <Camera className="text-status-orange-0 h-6 w-6" />,
        title: "Foto van kookboek",
        description: "Maak een foto van je favoriete recept",
        method: "photo",
        className: "border-slate-200 bg-status-orange-bg",
    },
    {
        icon: <LinkIcon className="text-status-blue-0 h-6 w-6" />,
        title: "Van website",
        description: "Plak een link van je favoriete site",
        method: "url",
        className: "border-slate-200 bg-status-blue-bg",
    },
    {
        icon: <PenSquare className="text-status-purple-0 h-6 w-6" />,
        title: "Zelf typen",
        description: "Schrijf je eigen recept op",
        method: "manual",
        className: "border-slate-200 bg-status-purple-bg",
    },
] as const

export function AddRecipeScreen({ onImportStarted, onSkip }: Readonly<AddRecipeScreenProps>) {
    const [activePopup, setActivePopup] = useState<"photo" | "url" | "manual" | null>(null)

    const handleImport = () => {
        setActivePopup(null)
        onImportStarted()
    }

    return (
        <>
            <div className="flex h-full flex-col">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Voeg je eerste recept toe</h2>
                    <p className="text-muted-foreground mt-2">
                        Kies de manier die het beste bij je past om te beginnen met je verzameling
                    </p>
                </div>
                <div className="mt-8 flex flex-1 flex-col gap-4">
                    {importOptions.map((option) => (
                        <ImportButton
                            key={option.method}
                            onClick={() => setActivePopup(option.method)}
                            icon={option.icon}
                            title={option.title}
                            description={option.description}
                            className={option.className}
                        />
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <Button onClick={onSkip} variant="link" className="text-primary">
                        Later misschien - maak eerst een account aan
                    </Button>
                </div>
            </div>
            {activePopup === "url" && (
                <UrlImportPopup onDismiss={() => setActivePopup(null)} onSubmit={handleImport} />
            )}
            {activePopup === "photo" && (
                <PhotoImportView onDismiss={() => setActivePopup(null)} onSubmit={handleImport} />
            )}
            {activePopup === "manual" && (
                <TextImportPopup onDismiss={() => setActivePopup(null)} onSubmit={handleImport} />
            )}
        </>
    )
}

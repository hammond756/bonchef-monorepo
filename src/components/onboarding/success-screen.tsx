import { Button } from "@/components/ui/button"
import { AlertTriangle, Check, Share2, Smartphone } from "lucide-react"

interface SuccessScreenProps {
    onAcknowledge: () => void
}

export function SuccessScreen({ onAcknowledge }: Readonly<SuccessScreenProps>) {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Je recept is binnen 🎉</h2>
            <p className="text-muted-foreground mt-2 text-lg">Maak nu een account aan</p>
            <div className="mt-4 w-full max-w-sm">
                <div className="space-y-3">
                    <div className="bg-status-green-bg flex items-center space-x-3 rounded-lg p-2">
                        <Check className="text-status-green-text h-6 w-6" />
                        <p className="text-gray-700">Voor altijd in je collectie</p>
                    </div>
                    <div className="bg-status-blue-bg flex items-center space-x-3 rounded-lg p-2">
                        <Smartphone className="text-status-blue-text h-6 w-6" />
                        <p className="text-gray-700">Toegankelijk op al je apparaten</p>
                    </div>
                    <div className="bg-status-purple-bg flex items-center space-x-3 rounded-lg p-2">
                        <Share2 className="text-status-purple-0 h-6 w-6" />
                        <p className="text-gray-700">Deel eenvoudig via een link</p>
                    </div>
                </div>

                <Button
                    onClick={onAcknowledge}
                    className="mt-8 w-full font-bold"
                    size="lg"
                    aria-label="Aanmelden"
                >
                    ✨ Gratis account aanmaken
                </Button>
                <p className="text-muted-foreground mt-2 text-sm">30 sec · Geen creditcard nodig</p>

                <div className="mt-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <p className="text-red-700">
                        Zonder account verdwijnt je recept zodra je deze website sluit
                    </p>
                </div>
            </div>
        </div>
    )
}

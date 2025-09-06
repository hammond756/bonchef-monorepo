import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EditNotFound() {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Recept niet gevonden</h1>
            <p className="mb-8 text-lg text-gray-600">
                Het recept dat je probeert te bewerken bestaat niet of is niet toegankelijk.
            </p>
            <div className="space-x-4">
                <Button asChild>
                    <Link href="/collection">Ga naar je collectie</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/ontdek">Ontdek recepten</Link>
                </Button>
            </div>
        </div>
    )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProfileNotFound() {
    return (
        <main className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-md text-center">
                <h1 className="mb-4 text-3xl font-bold">Profiel niet gevonden</h1>
                <p className="text-muted-foreground mb-8">
                    Het profiel dat je zoekt bestaat niet of is niet beschikbaar.
                </p>
                <Button asChild>
                    <Link href="/">Terug naar homepage</Link>
                </Button>
            </div>
        </main>
    )
}

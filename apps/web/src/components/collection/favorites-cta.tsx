import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Call-to-action section displayed when user has no favorites yet
 */
export function FavoritesCTA() {
    return (
        <div className="py-10 text-center">
            <h2 className="mb-2 text-xl font-bold">Nog geen favorieten</h2>
            <p className="text-muted-foreground mb-4">
                Ontdek nieuwe recepten en sla ze op als favoriet.
            </p>
            <Button asChild>
                <Link href="/ontdek">Ontdek recepten</Link>
            </Button>
        </div>
    )
}

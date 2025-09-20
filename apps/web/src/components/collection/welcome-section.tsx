import { ArrowDown, PlusIcon } from "lucide-react"

/**
 * Welcome section displayed when user has no recipes yet
 */
export function WelcomeSection() {
    return (
        <div className="py-10 text-center">
            <h2 className="mb-2 text-xl font-bold">Welkom bij jouw kookboek!</h2>
            <p className="text-muted-foreground mb-4">
                Hier vind je al jouw recepten en favorieten op één plek. Klik op de{" "}
                <PlusIcon className="inline-block" /> knop om je eerste recept toe te voegen.
            </p>
            <ArrowDown className="mx-auto mt-[100px] h-20 w-20 animate-bounce" />
        </div>
    )
}

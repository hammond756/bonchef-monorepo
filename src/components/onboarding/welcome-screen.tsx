import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
    onNext: () => void
    onSkip: () => void
}

export function WelcomeScreen({ onNext, onSkip }: Readonly<WelcomeScreenProps>) {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-green-100">
                {/* TODO: Fix animation */}
                <span
                    className="animate-wave text-6xl"
                    style={{
                        animationIterationCount: 3,
                        animationDuration: "2.5s",
                        transformOrigin: "70% 70%",
                    }}
                >
                    👋
                </span>
            </div>
            <h2 className="text-4xl font-bold">Welkom bij Bonchef!</h2>
            <p className="text-muted-foreground mt-2 text-lg">Je nieuwe sociale kookboek</p>
            <div className="mt-10 w-full max-w-sm">
                <Button onClick={onNext} className="w-full" size="lg" aria-label="Volgende">
                    Laat me zien wat Bonchef doet! 👀
                </Button>
                <Button
                    onClick={onSkip}
                    variant="link"
                    className="text-primary mt-4 underline"
                    aria-label="Annuleren"
                >
                    Later misschien
                </Button>
            </div>
        </div>
    )
}

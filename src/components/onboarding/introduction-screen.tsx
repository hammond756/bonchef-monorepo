import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntroductionScreenProps {
    onNext: () => void
}

const features = [
    {
        icon: (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                <BookOpen className="h-6 w-6 text-white" />
            </div>
        ),
        title: "Jouw digitale kookboek",
        description: "Al je recepten op één plek. Van oma’s geheimen tot Instagram hits.",
        color: "bg-blue-100",
        barColor: "bg-blue-500",
    },
    {
        icon: (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <Users className="h-6 w-6 text-white" />
            </div>
        ),
        title: "Koken is samen leuker",
        description: "Deel recepten, laat reacties achter en inspireer elkaar.",
        color: "bg-green-100",
        barColor: "bg-green-500",
    },
    {
        icon: (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                <Target className="h-6 w-6 text-white" />
            </div>
        ),
        title: "Van moeten naar willen",
        description: "Motivatie door uitdagingen, beloningen en inspiratie.",
        badge: "Binnenkort beschikbaar",
        color: "bg-purple-100",
        barColor: "bg-purple-500",
    },
]

export function IntroductionScreen({ onNext }: Readonly<IntroductionScreenProps>) {
    return (
        <div className="flex h-full flex-col">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Ontdek Bonchef</h2>
            </div>
            <div className="mt-8 flex flex-1 flex-col gap-4">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative flex items-start gap-4 overflow-hidden rounded-lg p-4",
                            feature.color
                        )}
                    >
                        <div
                            className={cn("absolute top-0 bottom-0 left-0 w-1.5", feature.barColor)}
                        />
                        <div
                            className={cn(
                                "ml-4 flex h-10 w-10 items-center justify-center rounded-full",
                                feature.color
                            )}
                        >
                            {feature.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-text-default font-montserrat font-semibold">
                                {feature.title}
                            </h3>
                            <p className="text-text-muted text-sm">{feature.description}</p>
                            {feature.badge && (
                                <Badge className="bg-status-yellow-border text-status-yellow-text mt-2">
                                    {feature.badge}
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <Button onClick={onNext} className="w-full" size="lg">
                    Start met mijn eerste recept! 🚀
                </Button>
            </div>
        </div>
    )
}

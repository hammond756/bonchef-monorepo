"use client"

import { Minus, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ServingsCounterProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    className?: string
}

export function ServingsCounter({
    value,
    onChange,
    min = 1,
    max = 20,
    className,
}: ServingsCounterProps) {
    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1)
        }
    }

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1)
        }
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Users className="text-muted-foreground h-4 w-4" />

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="h-8 w-8"
                    aria-label="Verminder aantal personen"
                >
                    <Minus className="h-3 w-3" />
                </Button>

                <div className="flex items-center gap-1">
                    <span className="min-w-[2rem] text-center text-lg font-semibold">{value}</span>
                    <span className="text-muted-foreground text-sm">personen</span>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="h-8 w-8"
                    aria-label="Verhoog aantal personen"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

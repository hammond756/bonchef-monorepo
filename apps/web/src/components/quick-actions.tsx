import { Sparkles, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface FilterOption {
    id: string
    label: string
    category: string
}

interface QuickAction {
    icon: LucideIcon
    label: string
    onClick: () => void
}

interface QuickActionsProps {
    actions: QuickAction[]
    surpriseAction: () => void
    onFilterSelectionChange?: (hasSelectedFilters: boolean, count: number, prompt: string) => void
}

const generatePromptFromFilters = (selectedFilters: FilterOption[]) => {
    // Group filters by category
    const filtersByCategory = selectedFilters.reduce<Record<string, FilterOption[]>>(
        (acc, filter) => {
            if (!acc[filter.category]) {
                acc[filter.category] = []
            }
            acc[filter.category].push(filter)
            return acc
        },
        {}
    )

    // Build a natural language prompt from the selected filters
    const promptParts: string[] = []

    if (filtersByCategory.dietary?.length) {
        promptParts.push(filtersByCategory.dietary.map((f) => f.label).join(" en "))
    }

    if (filtersByCategory.time?.length) {
        promptParts.push(`klaar in ${filtersByCategory.time[0].label}`) // Use only the first time filter
    }

    if (filtersByCategory.mealType?.length) {
        promptParts.push(filtersByCategory.mealType.map((f) => f.label.toLowerCase()).join(" en "))
    }

    const ingredientParts: string[] = []

    if (filtersByCategory.protein?.length) {
        ingredientParts.push(...filtersByCategory.protein.map((f) => f.label))
    }

    if (filtersByCategory.vegetable?.length) {
        ingredientParts.push(...filtersByCategory.vegetable.map((f) => f.label))
    }

    if (filtersByCategory.herb?.length) {
        ingredientParts.push(...filtersByCategory.herb.map((f) => f.label))
    }

    if (ingredientParts.length) {
        promptParts.push(`met ${ingredientParts.join(", ")}`)
    }

    const cookingParts: string[] = []

    if (filtersByCategory.cookingMethod?.length) {
        cookingParts.push(...filtersByCategory.cookingMethod.map((f) => f.label))
    }

    if (filtersByCategory.cookingTechnique?.length) {
        cookingParts.push(...filtersByCategory.cookingTechnique.map((f) => f.label))
    }

    if (cookingParts.length) {
        promptParts.push(`bereid met ${cookingParts.join(" en ")}`)
    }

    return `Drie opties voor een recept: ${promptParts.join(", ")}`
}

export function QuickActions({
    actions,
    surpriseAction,
    onFilterSelectionChange,
}: QuickActionsProps) {
    const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([])

    // Notify parent component when filter selection changes
    useEffect(() => {
        const hasSelectedFilters = selectedFilters.length > 0
        const prompt = hasSelectedFilters ? generatePromptFromFilters(selectedFilters) : ""
        onFilterSelectionChange?.(hasSelectedFilters, selectedFilters.length, prompt)
    }, [selectedFilters, onFilterSelectionChange])

    // Filter options
    const dietaryOptions: FilterOption[] = [
        { id: "glutenvrij", label: "Glutenvrij", category: "dietary" },
        { id: "vega", label: "Vega", category: "dietary" },
        { id: "vegan", label: "Vegan", category: "dietary" },
        { id: "keto", label: "Keto", category: "dietary" },
        { id: "lactosevrij", label: "Lactosevrij", category: "dietary" },
    ]

    const timeOptions: FilterOption[] = [
        { id: "10min", label: "<10 min", category: "time" },
        { id: "15min", label: "<15min", category: "time" },
        { id: "20min", label: "<20 min", category: "time" },
        { id: "40min", label: "<40 min", category: "time" },
        { id: "60min", label: "<60 min", category: "time" },
    ]

    const mealTypeOptions: FilterOption[] = [
        { id: "gezond", label: "Gezond", category: "mealType" },
        { id: "comfortfood", label: "Comfortfood", category: "mealType" },
        { id: "kindvriendelijk", label: "Kindvriendelijk", category: "mealType" },
        { id: "lentevoedsel", label: "Lentevoedsel", category: "mealType" },
    ]

    const proteinOptions: FilterOption[] = [
        { id: "kip", label: "Kip", category: "protein" },
        { id: "rund", label: "Rund", category: "protein" },
        { id: "magere_vis", label: "Magere vis", category: "protein" },
        { id: "vette_vis", label: "Vette vis", category: "protein" },
        { id: "vleesvervanger", label: "Vleesvervanger", category: "protein" },
    ]

    const vegetableOptions: FilterOption[] = [
        { id: "paprika", label: "Paprika", category: "vegetable" },
        { id: "courgette", label: "Courgette", category: "vegetable" },
        { id: "knolselderij", label: "Knolselderij", category: "vegetable" },
        { id: "veldsla", label: "Veldsla", category: "vegetable" },
        { id: "citroen", label: "Citroen", category: "vegetable" },
    ]

    const herbOptions: FilterOption[] = [
        { id: "rode_ui", label: "Rode ui", category: "herb" },
        { id: "champignons", label: "Champignons", category: "herb" },
        { id: "venkel", label: "Venkel", category: "herb" },
        { id: "radijs", label: "Radijs", category: "herb" },
        { id: "rode_ui2", label: "Rode ui", category: "herb" },
    ]

    const cookingMethodOptions: FilterOption[] = [
        { id: "oven", label: "Oven", category: "cookingMethod" },
        { id: "grillen", label: "Grillen", category: "cookingMethod" },
        { id: "bakken", label: "Bakken", category: "cookingMethod" },
        { id: "koken", label: "Koken", category: "cookingMethod" },
        { id: "stoven", label: "Stoven", category: "cookingMethod" },
    ]

    const cookingTechniqueOptions: FilterOption[] = [
        { id: "frituren", label: "Frituren", category: "cookingTechnique" },
        { id: "blancheren", label: "Blancheren", category: "cookingTechnique" },
        { id: "pocheren", label: "Pocheren", category: "cookingTechnique" },
        { id: "roken", label: "Roken", category: "cookingTechnique" },
        { id: "wokken", label: "Wokken", category: "cookingTechnique" },
    ]

    // Combine all filter options into a single array
    const allFilterOptions: FilterOption[] = [
        ...dietaryOptions,
        ...timeOptions,
        ...mealTypeOptions,
        ...proteinOptions,
        ...vegetableOptions,
        ...herbOptions,
        ...cookingMethodOptions,
        ...cookingTechniqueOptions,
    ]

    const handleFilterToggle = (filter: FilterOption) => {
        setSelectedFilters((prev) => {
            // Check if filter is already selected
            const isSelected = prev.some((f) => f.id === filter.id)

            // If it's selected, remove it
            if (isSelected) {
                return prev.filter((f) => f.id !== filter.id)
            }

            // If not selected, add it
            return [...prev, filter]
        })
    }

    const isFilterSelected = (filterId: string) => {
        return selectedFilters.some((filter) => filter.id === filterId)
    }

    const renderFilterButtons = (options: FilterOption[]) => {
        return options.map((option) => (
            <button
                key={`${option.category}-${option.id}`}
                onClick={() => handleFilterToggle(option)}
                className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isFilterSelected(option.id)
                        ? "border-green-500 bg-green-100 font-medium text-green-800"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                )}
            >
                {option.label}
            </button>
        ))
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div>
                <h1 className="mb-2 text-4xl font-bold">Wat eten we?</h1>
                <p className="text-muted-foreground">Maak snel en eenvoudig je eigen recept</p>
            </div>

            <div>
                <h2 className="mb-4 text-lg font-semibold">Kies een snelle actie</h2>
                <div className="grid grid-cols-1 gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={cn(
                                "flex items-center gap-2 rounded-lg p-3 text-left",
                                "bg-green-50 transition-colors hover:bg-green-100",
                                "border border-green-200"
                            )}
                        >
                            <action.icon className="h-4 w-4 text-green-700" />
                            <span className="text-sm">{action.label}</span>
                        </button>
                    ))}

                    <button
                        onClick={surpriseAction}
                        data-testid="surprise-me"
                        className={cn(
                            "flex items-center gap-2 rounded-lg p-3 text-left",
                            "bg-purple-50 transition-colors hover:bg-purple-100",
                            "border border-purple-200"
                        )}
                    >
                        <Sparkles className="h-4 w-4 text-purple-700" />
                        <span className="text-sm">Verras me</span>
                    </button>
                </div>
            </div>

            <div>
                <h2 className="mb-4 text-lg font-semibold">Of kies een startpunt</h2>
                <p className="text-muted-foreground mb-4">
                    Combineer verschillende eigenschappen om een recept op maat te maken
                </p>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {renderFilterButtons(allFilterOptions)}
                    </div>
                </div>
            </div>
        </div>
    )
}

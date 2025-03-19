"use client"

import { useState } from "react"
import { useRecipeGeneration } from "@/hooks/use-recipe-generation"
import { generateRecipe } from "@/app/create/actions"
import { Loader2 } from "lucide-react"

interface SaveRecipeButtonProps {
  message: string
  onSaved: (url: string) => void
}

export function SaveRecipeButton({ message, onSaved }: SaveRecipeButtonProps) {
  const [recipeUrl, setRecipeUrl] = useState<string | null>(null)
  
  const { isLoading, setIsLoading, progress, setTaskId } = useRecipeGeneration({
    onSuccess: async (recipe) => {
      try {
        const response = await fetch("/api/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...recipe,
            is_public: false // Set recipes as private by default
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save recipe")
        }

        const data = await response.json()
        const savedRecipeUrl = `/recipes/${data.recipe.id}`
        setRecipeUrl(savedRecipeUrl)
        onSaved(savedRecipeUrl)
      } catch (error) {
        console.error("Failed to save recipe:", error)
      }
    },
    onError: (error) => {
      console.error("Failed to generate recipe:", error)
    }
  })

  async function handleSave() {
    setIsLoading(true)
    try {
      const result = await generateRecipe(message, "thuiskok")
      setTaskId(result)
    } catch (error) {
      console.error("Failed to save recipe:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2">
      {!recipeUrl && (
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-full border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium"
          data-testid="save-recipe-button"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opslaan... {Math.round(progress * 100)}%</span>
            </div>
          ) : (
            "Opslaan in collectie"
          )}
        </button>
      )}
      {recipeUrl && (
        <a
          href={recipeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-full border-2 border-green-500 text-green-600 hover:bg-green-50 inline-block text-sm font-medium"
          data-testid="save-view-button"
        >
          Bekijk recept
        </a>
      )}
    </div>
  )
} 
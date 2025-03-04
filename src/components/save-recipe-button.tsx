"use client"

import { useState } from "react"
import { useRecipeGeneration } from "@/hooks/use-recipe-generation"
import { generateRecipe } from "@/app/create/actions"

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
    <div className="mt-1 text-xs">
      {!recipeUrl && (
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="text-blue-500 hover:text-blue-700 disabled:text-blue-300"
          data-testid="save-recipe-button"
        >
          {isLoading ? `Opslaan... ${progress * 100}%` : "Opslaan in collectie"}
        </button>
      )}
      {recipeUrl && (
        <a
          href={recipeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
          data-testid="save-view-button"
        >
          Bekijk recept
        </a>
      )}
    </div>
  )
} 
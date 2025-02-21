"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { generateRecipe, WriteStyle } from "@/app/create/actions";
import { useRouter } from "next/navigation";
import { useRecipeGeneration } from "@/hooks/use-recipe-generation";

export function SubmitRecipe() {
  const [recipeText, setRecipeText] = useState("");
  const [writeStyle, setWriteStyle] = useState<WriteStyle>("professioneel");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { isLoading, setIsLoading, progress, setTaskId } = useRecipeGeneration({
    onSuccess: async (recipe) => {
      try {
        const response = await fetch("/api/save-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipe),
        });
        
        const data = await response.json();
        if (data.recipe?.id) {
          router.push(`/edit/${data.recipe.id}`);
        }
      } catch (err) {
        setError("Failed to save recipe: " + err);
        console.error(err);
      }
    },
    onError: (error) => {
      setError(error);
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const newTaskId = await generateRecipe(recipeText, writeStyle);
      setTaskId(newTaskId);
    } catch (err) {
      setError("Failed to submit recipe. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Beschrijf hier je recept..."
        className="min-h-[200px]"
        disabled={isLoading}
      />

      <div className="space-y-2">
        <label htmlFor="writeStyle" className="text-sm font-medium">
          Schrijfstijl
        </label>
        <Select
          value={writeStyle}
          onValueChange={(value) => setWriteStyle(value as WriteStyle)}
          disabled={isLoading}
        >
          <SelectTrigger id="writeStyle">
            <SelectValue placeholder="Selecteer schrijfstijl" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professioneel">Professioneel</SelectItem>
            <SelectItem value="thuiskok">Thuiskok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isLoading && (
        <div className="text-sm text-muted-foreground">
          Laden... {progress * 100}%
        </div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Laden..." : "Maak recept"}
      </Button>
    </form>
  );
} 
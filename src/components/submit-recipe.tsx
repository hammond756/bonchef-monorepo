"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { RecipeForm } from "./recipe-form";
import type { GeneratedRecipe } from "@/lib/types";

export function SubmitRecipe() {
  const [recipeText, setRecipeText] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recipeText }),
      });
      
      const data = await response.json();
      setGeneratedRecipe(data);
    } catch (error) {
      console.error("Failed to parse recipe:", error);
    }
  }

  if (generatedRecipe) {
    return <RecipeForm recipe={generatedRecipe} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Paste your recipe here..."
        className="min-h-[200px]"
      />
      <Button type="submit">Format Recipe</Button>
    </form>
  );
} 
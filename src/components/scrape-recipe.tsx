"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { RecipeForm } from "./recipe-form";
import { scrapeRecipe, getTaskStatus } from "@/app/create/actions";
import { GeneratedRecipeSchema, type GeneratedRecipe } from "@/lib/types";

export function ScrapeRecipe() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const recipe = await scrapeRecipe(url);
      console.log(recipe);
      setGeneratedRecipe(GeneratedRecipeSchema.parse(recipe));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape recipe. Please try again.");
    }
    setIsLoading(false);
  }

  if (generatedRecipe) {
    return <RecipeForm recipe={generatedRecipe} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          URL
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/recipe"
          disabled={isLoading}
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </>
        ) : (
          "Haal recept op"
        )}
      </Button>
    </form>
  );
}
    
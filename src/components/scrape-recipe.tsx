"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { scrapeRecipe } from "@/app/create/actions";
import { RecipeSchema } from "@/lib/types";
import { useRouter } from "next/navigation";

export function ScrapeRecipe() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const recipe = await scrapeRecipe(url);
      const validatedRecipe = RecipeSchema.parse(recipe);
      
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validatedRecipe,
          is_public: false // Set recipes as private by default
        }),
      });
      
      const data = await response.json();
      if (data.recipe?.id) {
        router.push(`/edit/${data.recipe.id}`);
      } else {
        throw new Error("Failed to save recipe");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape recipe. Please try again.");
      setIsLoading(false);
    }
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

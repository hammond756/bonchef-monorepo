"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import type { GeneratedRecipe } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { checkTaskStatus, submitRecipeText } from "@/lib/services/recipe-service";
import { RecipeForm } from "./recipe-form";

export function SubmitRecipe() {
  const [recipeText, setRecipeText] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(
    null
  );

  useEffect(() => {
    if (!taskId) return;

    const intervalId = setInterval(async () => {
      try {
        const status = await checkTaskStatus(taskId);
        setProgress(status.progress);

        if (status.status === "SUCCESS" && status.result) {
          setGeneratedRecipe(status.result);
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (status.status === "FAILURE") {
          setError("Failed to generate recipe. Please try again.");
          setIsLoading(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        setError("An error occurred while checking recipe status");
        setIsLoading(false);
        clearInterval(intervalId);
      }
    }, process.env.NEXT_PUBLIC_REFRESH_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) : 5000);

    return () => clearInterval(intervalId);
  }, [taskId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const newTaskId = await submitRecipeText(recipeText);
      setTaskId(newTaskId);
    } catch (err) {
      setError("Failed to submit recipe. Please try again.");
      setIsLoading(false);
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
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isLoading && (
        <div className="text-sm text-muted-foreground">
          Processing... {progress}%
        </div>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          "Format Recipe"
        )}
      </Button>
    </form>
  );
} 
import { useState, useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { GeneratedRecipe } from "@/lib/types";

interface UseRecipeGenerationProps {
  onStreaming?: (recipe: GeneratedRecipe) => void;
  onComplete?: (recipe: GeneratedRecipe) => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

export function useRecipeGeneration({
  onStreaming,
  onComplete,
  onClose,
  onError,
}: UseRecipeGenerationProps = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setIsCompleted(false);
      setHasError(false);
      setError(null);

      try {
        await fetchEventSource("/api/public/generate-recipe", {
          method: "POST",
          body: JSON.stringify({ text: content }),
          headers: {
            "Content-Type": "application/json",
          },
          onmessage: (event: any) => {
            const generatedRecipe = JSON.parse(event.data);

            switch (event.event) {
              case "streaming":
                onStreaming?.(generatedRecipe);
                break;
              case "complete":
                setIsCompleted(true);
                onComplete?.(generatedRecipe);
                break;
            }
          },
          onclose: () => {
            setIsStreaming(false);
            onClose?.();
          },
          onerror: (error: any) => {
            setHasError(true);
            setError(error.message || "An error occurred");
            onError?.(error);
          },
        });
      } catch (error) {
        setHasError(true);
        setError("Failed to generate recipe. Please try again.");
        onError?.(error);
      }
    },
    [onStreaming, onComplete, onClose, onError]
  );

  return {
    generateRecipe,
    isStreaming,
    isCompleted,
    hasError,
    error,
  };
} 
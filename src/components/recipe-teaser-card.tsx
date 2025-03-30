"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createStreamingRequest } from "@/lib/stream-parsers";
import { Recipe, GeneratedRecipe } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { patchMessagePayload } from "@/app/actions";
interface RecipeTeaserCardProps {
  content: string;
  onRecipeSelected: (recipe: GeneratedRecipe) => void;
  messageId: string | null;
  initialRecipe?: GeneratedRecipe;
}

export function RecipeTeaserCard({ content, onRecipeSelected, messageId, initialRecipe }: RecipeTeaserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(initialRecipe || null);

  const handleTeaserClick = async () => {
    // If we have an initial recipe, we don't have to generate it
    if (recipe) {
      onRecipeSelected(recipe);
      return;
    }

    if (!messageId) {
      setError("No message ID found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createStreamingRequest<GeneratedRecipe>(
        "/api/generate-recipe",
        { teaserContent: content },
        {
          onLoading: (loading) => {
            setIsLoading(loading);
          },
          onChunkReceived: (parsedResponse) => {
            console.log("onChunkReceived", parsedResponse)
            // If we have a complete recipe already, we can pass it to the handler
            if (parsedResponse) {
              onRecipeSelected(parsedResponse);
              setIsLoading(false);
            }
          },
          onStreamComplete: (finalResponse) => {
            onRecipeSelected(finalResponse);
            setRecipe(finalResponse);
            setIsLoading(false);
            patchMessagePayload(messageId, { recipe: finalResponse })
          },
          onError: (error) => {
            setError("Failed to load recipe details. Please try again.");
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      setError("Failed to load recipe details. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all overflow-hidden ${
        recipe ? "bg-green-100" : ""
      } ${!messageId ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={messageId ? handleTeaserClick : undefined}
      data-testid="teaser-card"
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <ReactMarkdown 
          rehypePlugins={[rehypeSanitize]}
          components={{
            a: ({ node, ...props }) => (
              <a 
                {...props} 
                className="text-blue-500 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className="list-decimal pl-4" />
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} className="list-disc pl-4" />
            ),
            p: ({ node, ...props }) => (
              <p {...props} className="py-1 whitespace-pre-wrap" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
          <p className="text-sm text-gray-500 mt-4">
            {isLoading 
              ? "Recept laden..." 
              : recipe 
                ? "Klik om het recept te bekijken" 
                : "Klik om het recept te genereren"}
          </p>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex items-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <ChevronRight className={`h-5 w-5 ${!messageId ? "text-gray-300" : "text-gray-400"}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
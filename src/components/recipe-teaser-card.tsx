"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GeneratedRecipe } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { patchMessagePayload } from "@/app/actions";
import { useRecipeGeneration } from "@/hooks/use-recipe-generation";
import { RecipeModal } from "./recipe-modal";

interface RecipeTeaserCardProps {
  content: string;
  messageId: string | null;
  initialRecipe?: GeneratedRecipe;
}

export function RecipeTeaserCard({ content, messageId, initialRecipe }: RecipeTeaserCardProps) {
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(initialRecipe || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { generateRecipe, isStreaming, isCompleted, hasError, error } = useRecipeGeneration({
    onStreaming: (generatedRecipe) => {
      setRecipe(generatedRecipe);
    },
    onComplete: (generatedRecipe) => {
      if (messageId) {
        patchMessagePayload(messageId, { recipe: generatedRecipe });
      }
    },
  });

  const handleTeaserClick = async () => {
    // If we have an initial recipe, we don't have to generate it
    setIsModalOpen(true);

    await generateRecipe(content);
  };

  return (
    <>
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
              {isStreaming 
                ? "Recept laden..." 
                : recipe 
                  ? "Klik om het recept te bekijken" 
                  : "Zal ik het recept voor je uitschrijven?"}
            </p>
            {hasError && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex items-center">
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <ChevronRight className={`h-5 w-5 ${!messageId ? "text-gray-300" : "text-gray-400"}`} />
            )}
          </div>
        </CardContent>
      </Card>
      <RecipeModal 
        recipe={recipe} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        canSave={!isStreaming && !hasError}
      />
    </>
  );
} 
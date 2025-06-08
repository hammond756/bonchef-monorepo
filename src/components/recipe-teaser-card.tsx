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

  const { generateRecipe, isStreaming, hasError, error } = useRecipeGeneration({
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
    setIsModalOpen(true);
    await generateRecipe(content);
  };

  return (
    <>
      <Card 
        className={`group relative overflow-hidden rounded-lg transition-all duration-300 
           ${!messageId ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
        onClick={messageId ? handleTeaserClick : undefined}
        data-testid="teaser-card"
      >
        {isStreaming && (
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-gray-200/50 to-transparent animate-sheen pointer-events-none" />
        )}
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown 
                rehypePlugins={[rehypeSanitize]}
                components={{
                  a: ({ ...props }) => (
                    <a 
                      {...props} 
                      className="text-blue-500 hover:underline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol {...props} className="list-decimal pl-4" />
                  ),
                  ul: ({ ...props }) => (
                    <ul {...props} className="list-disc pl-4" />
                  ),
                  p: ({ ...props }) => (
                    <p {...props} className="py-1 whitespace-pre-wrap" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {isStreaming 
                  ? "Recept laden..." 
                  : recipe 
                    ? "Klik om het recept te bekijken" 
                    : "Zal ik het recept voor je uitschrijven?"}
              </p>
              <div className="flex items-center">
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                    !messageId ? "text-muted-foreground/30" : "text-muted-foreground"
                  }`} />
                )}
              </div>
            </div>
            {hasError && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
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
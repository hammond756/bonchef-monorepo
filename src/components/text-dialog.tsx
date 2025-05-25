"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { saveMarketingRecipe, generateRecipeFromSnippet } from "../actions/recipe-imports";
import { ProgressModal } from "../app/first-recipe/progress-modal";
import { usePostHog } from "posthog-js/react";

interface TextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (validFormData: { text: string }) => void;
}

function TextForm({ onSuccessfullyAdded, onSubmit }: { onSuccessfullyAdded: () => void, onSubmit: (validFormData: { text: string }) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const text = formData.get("text") as string;
    if (!text) {
      setError("Voer een geldige tekst in.");
      setIsLoading(false);
      return;
    }
    try {
        onSubmit({ text });
    } catch (e) {
      posthog?.captureException(e)
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      setIsLoading(false);
    }
  }

  const progressSteps = [
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "📸 Foto maken...",
    "🍚 Porties berekenen...",
    "✨ Een moment geduld..."
  ];

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea id="text" name="text" placeholder="Plak hier je recepttekst" className="min-h-[100px]" />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </Button>
        </div>
      </form>
      {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
    </>
  );
}

export function TextDialog({ open, onOpenChange, onSubmit }: TextDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plak tekst uit notities of WhatsApp</DialogTitle>
        </DialogHeader>
        <TextForm onSuccessfullyAdded={() => onOpenChange(false)} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
} 
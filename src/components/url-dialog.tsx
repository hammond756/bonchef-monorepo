"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProgressModal } from "../app/first-recipe/progress-modal";
import { usePostHog } from "posthog-js/react";
import { posthog } from "posthog-js";

interface UrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (validFormData: { url: string }) => void;
}

// TODO: make a list of example urls, that can only be used once
function setExampleUrl(formRef: React.RefObject<HTMLFormElement>) {
  const url = "https://thefoodietakesflight.com/stuffed-miso-butter-mushrooms/#recipe";

  if (!formRef.current) {
    return;
  }

  const input: HTMLInputElement | null = formRef.current.querySelector("input[name='url']");

  if (input) {
    input.value = url;
  }
}

function validateUrl(url: string) {
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname.includes("instagram") || urlObject.hostname.includes("facebook") || urlObject.hostname.includes("tiktok")) {
      return { 
        message: `Helaas is het nog niet mogelijk om te importeren van ${urlObject.hostname}. We werken eraan om meer bronnen te ondersteunen.`,
        triggerEvent: {
          name: "unsupported_url_import",
          properties: {
            details: {
              platform: urlObject.hostname,
              target_url: url
            }
          }
        }
      };
    }
    // TODO: check if the url is a valid recipe url
    return { message: null, triggerEvent: null };
  } catch (e: unknown) {
    posthog?.captureException(e)
    return { message: "Voer een geldige URL in.", triggerEvent: null };
  }
}

function UrlForm({ onSubmit }: { onSubmit: (validFormData: { url: string }) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const posthog = usePostHog()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;

    const { message, triggerEvent } = validateUrl(url);
    if (triggerEvent) {
      posthog?.capture(triggerEvent.name, triggerEvent.properties);
    }
    if (message) {
      setError(message);
      setIsLoading(false);
      return;
    }
    try {
      onSubmit({ url });
    } catch (e) {
      posthog?.captureException(e)
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      setIsLoading(false);
    }
  }

  const progressSteps = [
    "📖 Recept lezen...",
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "📸 Foto uitzoeken...",
    "✨ Een moment geduld..."
  ];

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit} ref={formRef}>
        <Input id="url" name="url" type="url" placeholder="Plak hier de URL" required />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setExampleUrl(formRef as React.RefObject<HTMLFormElement>)}>Kies voor mij</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </Button>
        </div>
      </form>
      {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
    </>
  );
}

export function UrlDialog({ open, onOpenChange, onSubmit }: UrlDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[40%]">
        <DialogHeader>
          <DialogTitle>Voeg toe via blogpost link</DialogTitle>
        </DialogHeader>
        <UrlForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
} 
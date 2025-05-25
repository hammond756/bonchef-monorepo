"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveMarketingRecipe, generateRecipeFromImage, getSignedUploadUrl } from "../actions/recipe-imports";
import { ProgressModal } from "../app/first-recipe/progress-modal";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { StorageService } from "@/lib/services/storage-service";
import { v4 as uuidv4 } from "uuid";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (validFormData: { imageUrl: string }) => void;
}

async function uploadImageToSignedUrl(file: File): Promise<string> {
  const supabase = await createClient();
  const filePath = `${uuidv4()}.${file.name.split(".").pop()}`;
  const { signedUrl, path, token } = await getSignedUploadUrl(filePath);
  const storageService = new StorageService(supabase);
  return await storageService.uploadToSignedUrl("recipe-images", path, file, token);
}

function ImageForm({ onSubmit }: { onSubmit: (validFormData: { imageUrl: string }) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { file, handleChange, handleRemove, preview, fileInputRef } = useFileUpload({ initialFilePath: null });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    if (!file) {
      setError("Geen bestand geselecteerd");
      setIsLoading(false);
      return;
    }
    try {
      const imageUrl = await uploadImageToSignedUrl(file);
      onSubmit({ imageUrl });
    } catch (e) {
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      setIsLoading(false);
    }
  }

  const progressSteps = [
    "📸 Foto uploaden...",
    "🧠 Inhoud herkennen...",
    "🧑‍🍳 Ingrediënten ophalen...",
    "📝 Recept schrijven...",
    "✨ Een moment geduld..."
  ];

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleChange}
          />
          {preview && !isLoading && (
            <div className="relative w-full max-w-[200px]">
              <Image
                src={preview}
                alt="Recipe image preview"
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-xs"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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

export function ImageDialog({ open, onOpenChange, onSubmit }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload foto van kookboek</DialogTitle>
        </DialogHeader>
        <ImageForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
} 
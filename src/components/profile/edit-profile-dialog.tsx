"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile, deleteProfileAvatarImage, uploadProfileAvatarImage } from "./actions";
import { ProfileImage } from "@/components/ui/profile-image";
import { X } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useFileUpload } from "@/hooks/use-file-upload";
interface EditProfileDialogProps {
  userId: string;
  initialDisplayName: string | null;
  initialBio: string | null;
  initialAvatar?: string | null;
}

export function EditProfileDialog({
  userId,
  initialDisplayName,
  initialBio,
  initialAvatar,
}: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { refreshProfile } = useProfile();

  const { 
    preview: previewImage,
    file: newAvatarFile,
    shouldRemove,
    handleChange: handleAvatarChange,
    handleRemove: handleRemoveAvatar,
    fileInputRef,
    reset: resetImageUpload,
  } = useFileUpload({initialFilePath: initialAvatar});

  const updateStorage = async (userId: string) => {
    let remoteUrl = null
    if (initialAvatar && shouldRemove) {
      deleteProfileAvatarImage(initialAvatar);
    }
    if (newAvatarFile) {
      remoteUrl = await uploadProfileAvatarImage(userId, newAvatarFile);
    }
    return remoteUrl;
  } 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (displayName.includes("~")) {
      setError("Weergavenaam mag geen tilde (~) bevatten.");
      return;
    }
    setIsLoading(true);
    try {
      const avatarUrl = await updateStorage(userId);
      await updateUserProfile(userId, displayName, bio, avatarUrl);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setError("Failed to update profile: " + (error as Error).message);
    } finally {
      setIsLoading(false);
      refreshProfile();
    }
  };

  function renderAvatar() {
    return (
      <ProfileImage src={previewImage} name={displayName} size={64} />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setDisplayName(initialDisplayName || "");
        setBio(initialBio || "");
        resetImageUpload();
        setError("");
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">Profiel bewerken</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profiel bewerken</DialogTitle>
          <DialogDescription>
            Werk je profielinformatie bij. Klik op opslaan wanneer je klaar bent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 relative">
            <div className="relative">
              {renderAvatar()}
              {previewImage && (
                <button
                  type="button"
                  aria-label="Verwijder profielfoto"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-300 shadow-sm p-0.5 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{ width: 32, height: 32 }}
                >
                  <X className="w-2 h-2 text-gray-500" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {previewImage ? "Wijzig profielfoto" : "Voeg profielfoto toe"}
            </Button>
          </div>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Weergavenaam
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Je weergavenaam"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm" role="alert">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Vertel iets over jezelf..."
              disabled={isLoading}
              className="h-32"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
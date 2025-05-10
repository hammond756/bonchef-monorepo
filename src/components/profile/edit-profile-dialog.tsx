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
import { updateUserProfile } from "./actions";
interface EditProfileDialogProps {
  userId: string;
  initialDisplayName: string | null;
  initialBio: string | null;
}

export function EditProfileDialog({
  userId,
  initialDisplayName,
  initialBio,
}: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // TODO: Update slug, but keep old slug active
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (displayName.includes("~")) {
      setError("Weergavenaam mag geen tilde (~) bevatten.");
      return;
    }
    setIsLoading(true);
    
    try {
      await updateUserProfile(userId, displayName, bio);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
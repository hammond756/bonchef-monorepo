"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Container } from "@/components/ui/container";

interface ClaimRecipeButtonProps {
  recipeId: string;
  ownerId: string;
  user?: User;
}

export function ClaimRecipeButton({ recipeId, ownerId, user }: ClaimRecipeButtonProps) {
  const router = useRouter();
  const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID;

  // Only show the button if:
  // 1. The recipe is owned by the marketing user
  // 2. The current user is not logged in
  if (!marketingUserId || ownerId !== marketingUserId || user) {
    return null;
  }

  const handleClaim = () => {
    // Store the recipe ID in the URL so we can claim it after signup
    router.push(`/signup?claimRecipe=${recipeId}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm py-4">
      <Container>
        <div className="flex flex-col items-center space-y-4 px-4">
          <div className="text-center space-y-2 max-w-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Dit recept delen?
            </h2>
            <p className="text-gray-600">
              Maak een gratis account aan om dit recept te bewaren in je persoonlijke collectie. 
              Je kunt het dan altijd terugvinden en delen met anderen.
            </p>
          </div>
          <Button 
            onClick={handleClaim}
            className="w-full max-w-sm"
            size="lg"
          >
            Claim dit recept
          </Button>
        </div>
      </Container>
    </div>
  );
} 
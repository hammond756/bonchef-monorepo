import { RecipeRead, GeneratedRecipe } from "@/lib/types";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { createProfileSlug, parseDescription } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { LikeButton } from "./like-button";
import React from "react";
import { ClaimRecipeButton } from "./claim-recipe-button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabsList } from "@/components/ui/app-tabs";
import { ProfileImage } from "@/components/ui/profile-image";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { InteractiveIngredientsList } from "@/components/interactive-ingredients-list";
import { RecipeInstructions, InstructionStep } from "./recipe-instructions";
import { ShareRecipeButton } from "./share-recipe-button";

interface RecipeThumbnailProps {
  title: string;
  thumbnail?: string;
  showThumbnail?: boolean;
}

function RecipeThumbnail({ title, thumbnail, showThumbnail = true }: RecipeThumbnailProps) {
  if (!showThumbnail || !thumbnail) return null;
  
  return (
    <div className="relative aspect-4/3 w-full mb-6 overflow-hidden">
      <Image
        data-testid="recipe-image"
        src={thumbnail}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

interface RecipeMetadataProps {
  recipe: RecipeRead
}

function RecipeMetadata({ 
  recipe,
  user
}: RecipeMetadataProps & { user?: User }) {
  return (
    <div className="px-4 space-y-2 py-1.5">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="h-5 w-5" />
          <span>{recipe.total_cook_time_minutes} min</span>
        </div>
        
        <EditRecipeButton 
          user={user} 
          ownerId={recipe.user_id} 
          recipeId={recipe.id} 
        />
      </div>

      {recipe.description && (
        <div className="prose prose-sm max-w-none pt-1.5 text-gray-600">
          {parseDescription(recipe.description).map((part, index) => {
            if (part.type === "url") {
              return (
                <a
                  key={index}
                  href={part.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  {part.content}
                </a>
              );
            }
            return <React.Fragment key={index}>{part.content}</React.Fragment>;
          })}
        </div>
      )}
    </div>
  );
}

interface EditRecipeButtonProps {
  user?: User;
  ownerId?: string;
  recipeId?: string;
}

function EditRecipeButton({ user, ownerId, recipeId }: EditRecipeButtonProps) {
  if (!user || !ownerId || !recipeId || user.id !== ownerId) return null;

  return (
    <Link
      href={`/edit/${recipeId}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      <PencilIcon className="h-3.5 w-3.5" />
      <span>Bewerk recept</span>
    </Link>
  );
}

interface BaseRecipeDetailProps {
  variant: "generated" | "saved";
  user?: User;
}

interface GeneratedRecipeDetailProps extends BaseRecipeDetailProps {
  variant: "generated";
  recipe: GeneratedRecipe;
}

interface SavedRecipeDetailProps extends BaseRecipeDetailProps {
  variant: "saved";
  recipe: RecipeRead;
}

type RecipeDetailProps = GeneratedRecipeDetailProps | SavedRecipeDetailProps;

export function RecipeDetail({ variant, recipe, user }: RecipeDetailProps) {
  // Log de profiel data om te debuggen
  if (variant === "saved" && recipe.profiles) {
    console.log("[RecipeDetail] Profiles data:", JSON.stringify((recipe as RecipeRead).profiles, null, 2));
  } else if (variant === "saved") {
    console.log("[RecipeDetail] Profiles data is missing or undefined.");
  }

  const detailTabs = [
    { value: "ing", label: "Ingrediënten" },
    { value: "ins", label: "Bereiding" },
    { value: "nutr", label: "Voeding" },
  ];

  return (
    <>
      {/* De ClaimRecipeButton wordt verplaatst naar de gepadde content hieronder */}
      
      <div className="container mx-auto max-w-4xl"> {/* Hoofdcontainer nu weer met 'container' class, zonder px-4 */}
        {variant === "saved" && recipe.thumbnail && (
          <div className="relative aspect-[3/4] w-full overflow-hidden mb-6"> {/* Afbeelding wrapper, geen -mx-4, geen rounded-lg */}
            {recipe.thumbnail && (
              <Image
                src={recipe.thumbnail!}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 600px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end text-white">
              {/* Titel en chef info op afbeelding */}
              <div className="flex flex-col pr-16">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block mb-1"
                >
                  <h1 className="text-2xl md:text-4xl font-extrabold line-clamp-2 drop-shadow-lg" data-testid="recipe-title">
                    {recipe.title}
                  </h1>
                </Link>
                {recipe.profiles && (
                  <Link 
                    href={`/profiles/~${recipe.profiles.id}`}
                    className="block text-xs group/profile"
                  >
                    <span className="font-medium group-hover/profile:underline">
                      {recipe.profiles.display_name || "Anonieme chef"}
                    </span>
                    {recipe.created_at && (
                      <>
                        <span className="mx-2 text-xs text-gray-300 group-hover/profile:text-primary transition-colors">
                          |
                        </span>
                        <span className="text-xs text-gray-300 group-hover/profile:text-primary transition-colors">
                          {format(new Date((recipe as RecipeRead).created_at!), "d MMM yyyy", { locale: nl })}
                        </span>
                      </>
                    )}
                  </Link>
                )}
              </div>
              {/* Actieknoppen op afbeelding */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2">
                <ShareRecipeButton 
                  title={recipe.title} 
                  text={`Bekijk dit recept: ${recipe.title}`}
                />
                {user && recipe.id && (
                  <LikeButton
                    buttonSize="md"
                    recipeId={recipe.id!}
                    initialLiked={recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count || 0}
                  />
                )}
                {recipe.profiles && (
                  <Link 
                    href={`/profiles/~${recipe.profiles.id}`}
                    className="group/profile rounded-full h-12 w-12 flex items-center justify-center bg-white/80 hover:bg-white/95 transition-colors duration-200"
                  >
                    <ProfileImage
                      src={recipe.profiles.avatar}
                      name={recipe.profiles.display_name || "Anonieme chef"}
                      size={46}
                      className="border-2 border-transparent group-hover/profile:border-primary transition-colors"
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nieuwe wrapper voor alle content die padding nodig heeft */}
        <div className="px-4">
          {variant === "saved" && <ClaimRecipeButton
            user={user}
            ownerId={recipe.user_id}
            recipeId={recipe.id}
          />}
          
          { (variant !== "saved" || !recipe.thumbnail) && 
            <h1 className="text-3xl font-bold text-gray-900 pb-4" data-testid="recipe-title"> {/* px-4 hier verwijderd, pb-4 blijft */} 
              {recipe.title}
            </h1>
          }

          {variant === "saved" && <RecipeMetadata
            recipe={recipe}
            user={user}
          />}

          <div className="mt-8">
            <Tabs 
              defaultValue="ing"
              // className for Tabs root can be added here if needed
            >
              <AppTabsList 
                tabs={detailTabs}
                // tabsListClassName="bg-green-50" // This prop is now removed
              />

              {/* TabsContent needs to be managed here, outside AppTabs */}
              <TabsContent value="ing" className="pt-6">
                <InteractiveIngredientsList 
                  ingredientGroups={recipe.ingredients || []}
                  initialServings={recipe.n_portions || 1}
                />
              </TabsContent>
              <TabsContent value="ins" className="pt-6">
                <RecipeInstructions 
                  instructions={((recipe.instructions as string[]) || []).map((text, index): InstructionStep => ({
                    id: `instr-${index}-${variant === 'saved' ? recipe.id : 'generated'}`,
                    text 
                  }))}
                />
              </TabsContent>
              <TabsContent value="nutr" className="pt-6">
                <Card className="py-6 rounded-lg">
                  <p className="text-center italic text-gray-400">
                    Deze functionaliteit komt spoedig.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
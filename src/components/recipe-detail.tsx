import { Ingredient, RecipeRead, GeneratedRecipe } from "@/lib/types";
import Image from "next/image";
import { Clock, Users, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { formatIngredientLine, parseDescription } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { LikeButton } from "./like-button";
import React from "react";

interface RecipeThumbnailProps {
  title: string;
  thumbnail?: string;
  showThumbnail?: boolean;
}

function RecipeThumbnail({ title, thumbnail, showThumbnail = true }: RecipeThumbnailProps) {
  if (!showThumbnail || !thumbnail) return null;
  
  return (
    <div className="relative aspect-[16/9] w-full mb-6 overflow-hidden">
      <Image
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
  user?: User;
}

function RecipeMetadata({ 
  recipe,
  user
}: RecipeMetadataProps) {
  return (
    <div className="px-4 space-y-4">
      <div className="flex justify-between items-center">
        {recipe.profiles && (
          <p className="text-gray-500">Door {recipe.profiles.display_name}</p>
        )}
        {user && recipe.id && (
          <LikeButton 
            recipeId={recipe.id} 
            initialLiked={recipe.is_liked_by_current_user} 
            initialLikeCount={recipe.like_count || 0}
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-5 w-5" />
          <span>{recipe.total_cook_time_minutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="h-5 w-5" />
          <span>{recipe.n_portions} personen</span>
        </div>
        <Badge variant={recipe.is_public ? "default" : "secondary"}>
          {recipe.is_public ? (
            <>
              <Globe className="h-4 w-4 mr-1" />
              Openbaar
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Privé
            </>
          )}
        </Badge>
      </div>

      <div className="prose prose-lg max-w-none">
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
    <div className="flex justify-center mb-4">
      <Link
        href={`/edit/${recipeId}`}
        className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700"
      >
        <PencilIcon className="h-4 w-4" />
        <span>Bewerk recept</span>
      </Link>
    </div>
  );
}

interface RecipeIngredientsProps {
  ingredients: { ingredients: Ingredient[]; name: string }[];
}

function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Ingrediënten</h2>
      <Separator className="mb-4" />
      {ingredients.map((group: any, index: number) => (
        <div key={index} className="mb-6">
          {group.name !== "no_group" && <h3 className="font-medium mb-2">{group.name}</h3>}
          <ul className="space-y-2">
            {group.ingredients && group.ingredients.map((ingredient: any, idx: number) => (
              <li key={idx} className="text-muted-foreground">
                {ingredient.description && formatIngredientLine(ingredient, 1)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
  );
}

interface RecipeInstructionsProps {
  instructions: string[];
}

function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Instructies</h2>
      <Separator className="mb-4" />
      <ol className="space-y-4 list-decimal list-inside">
        {instructions.map((instruction: string, index: number) => (
          <li key={index} className="text-muted-foreground">
            {instruction}
          </li>
        ))}
      </ol>
    </Card>
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
  return (
    <div className="container mx-auto max-w-4xl">
      {variant === "saved" && <RecipeThumbnail
        title={recipe.title}
        thumbnail={recipe.thumbnail}
        showThumbnail={true}
      />}

      
      <h1 className="text-3xl font-bold text-gray-900 px-4 pb-4">{recipe.title}</h1>

      {variant === "saved" && <RecipeMetadata
        recipe={recipe}
        user={user}
      />}

      {variant === "saved" && <EditRecipeButton
        user={user}
        ownerId={recipe.user_id}
        recipeId={recipe.id}
      />}

      <div className="grid md:grid-cols-2 gap-8">
        <RecipeIngredients ingredients={recipe.ingredients || []} />
        <RecipeInstructions instructions={recipe.instructions || []} />
      </div>
    </div>
  );
}
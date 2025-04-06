import { Recipe } from "@/lib/types";
import Image from "next/image";
import { Clock, Users, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { formatIngredientLine, parseDescription } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface RecipeMetadataProps {
  total_cook_time_minutes: number;
  n_portions: number;
  isPublic: boolean;
}

function RecipeMetadata({ total_cook_time_minutes, n_portions, isPublic }: RecipeMetadataProps) {
  return (
    <div className="flex justify-center gap-8 mb-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span>{total_cook_time_minutes} minuten</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span>{n_portions} porties</span>
      </div>
      <div className="flex items-center gap-2">
        {isPublic ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Openbaar</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Privé</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

interface RecipeHeaderProps {
  title: string;
  description: string;
  profile?: { display_name: string };
  thumbnail?: string;
  showThumbnail?: boolean;
}

function RecipeHeader({ title, description, profile, thumbnail, showThumbnail = true }: RecipeHeaderProps) {
  const parsedDescription = parseDescription(description);
  
  return (
    <>
      {showThumbnail && thumbnail && (
        <div className="relative w-full h-[400px] overflow-hidden mb-8">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            data-testid="recipe-image"
            priority
          />
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4" data-testid="recipe-title">
          {title}
        </h1>
        {profile && (
          <p className="text-md text-muted-foreground mb-4">
            Door: {profile.display_name}
          </p>
        )}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {parsedDescription.map((part, index) => {
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
            return part.content;
          })}
        </p>
      </div>
    </>
  );
}

interface RecipeIngredientsProps {
  ingredients: any[];
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

interface RecipeDetailProps {
  recipe: Recipe;
  recipeId?: string;
  ownerId?: string;
  isPublic?: boolean;
  profile?: { display_name: string };
  showThumbnail?: boolean;
  user?: User;
}

export function RecipeDetail({ recipe, profile, isPublic = false, ownerId, recipeId, showThumbnail = true, user }: RecipeDetailProps) {
  return (
    <div className="container mx-auto max-w-4xl">
      <RecipeHeader
        title={recipe.title}
        description={recipe.description}
        profile={profile}
        thumbnail={recipe.thumbnail}
        showThumbnail={showThumbnail}
      />

      <RecipeMetadata
        total_cook_time_minutes={recipe.total_cook_time_minutes}
        n_portions={recipe.n_portions}
        isPublic={isPublic}
      />

      {user && ownerId === user.id && recipeId && (
        <div className="flex justify-center mb-4">
          <Link
            href={`/edit/${recipeId}`}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Bewerk recept</span>
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <RecipeIngredients ingredients={recipe.ingredients || []} />
        <RecipeInstructions instructions={recipe.instructions || []} />
      </div>
    </div>
  );
}
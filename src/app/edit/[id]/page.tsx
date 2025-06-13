import { getRecipe } from "@/app/recipes/[id]/actions";
import { RecipeForm } from "@/components/recipe-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PageContentSpacer } from "@/components/layout/page-content-spacer";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const recipe = await getRecipe(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!recipe) {
    return <div>Er is iets misgegaan bij het laden van het recept. <a href={`/recipes/${id}`}>Ga terug naar het recept</a></div>
  }

  const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID;
  const isMarketingRecipe = recipe.user_id === marketingUserId;

  if (user) {
    // Logged-in user can only edit their own recipes.
    if (recipe.user_id !== user.id) {
      redirect("/recipes/" + id);
    }
  } else {
    // Anonymous user can only edit a marketing recipe.
    if (!isMarketingRecipe) {
      redirect(`/login?redirect=/edit/${id}`);
    }
  }

  return (
    <>
      <PageContentSpacer />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Recept bewerken</h1>
        <RecipeForm recipe={recipe} recipeId={id} isPublic={recipe.is_public} />
      </main>
    </>
  );
}
import { getRecipe } from "@/app/recipes/[id]/actions";
import { RecipeForm } from "@/components/recipe-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const recipe = await getRecipe(id);

  if (!recipe) {
    return <div>Er is iets misgegaan bij het laden van het recept. <a href={`/recipes/${id}`}>Ga terug naar het recept</a></div>
  }

  // Check if user owns this recipe
  if (recipe.user_id !== user.id) {
    redirect("/recipes/" + id);
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Recept bewerken</h1>
      <RecipeForm recipe={recipe} recipeId={id} isPublic={recipe.is_public} />
    </main>
  );
}
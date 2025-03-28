import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("id", id)
    .single();

  if (recipeError) {
    console.log("recipeError", recipeError)
    if (recipeError.code === "PGRST116") {
      console.log("Recipe not found")
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    } else if (recipeError.code === "PGRST117") {
      console.log("Recipe is not public")
      return NextResponse.json({ error: "Recipe is not public" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }

  return NextResponse.json({recipe});
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if the recipe is public before deleting
    const { data: recipe, error: recipeError } = await supabase
      .from("recipe_creation_prototype")
      .select("id, is_public")
      .eq("id", id)
      .single();

    if (recipeError) {
      if (recipeError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }
      throw recipeError;
    }

    // Delete the recipe
    const { error: deleteError } = await supabase
      .from("recipe_creation_prototype")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Revalidate cache if needed
    if (recipe.is_public) {
      // Revalidate the discover page
      revalidatePath("/ontdek");
    }
    
    // Revalidate the specific recipe page
    revalidatePath(`/recipes/${id}`);
    
    return NextResponse.json(
      { message: "Recipe deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
} 
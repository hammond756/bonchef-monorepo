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
    .select("*, profiles!recipe_creation_prototype_user_id_fkey(display_name)")
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

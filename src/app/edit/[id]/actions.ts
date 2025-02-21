"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function deleteRecipe(recipeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("recipe_creation_prototype")
    .delete()
    .eq("id", recipeId);

  if (error) {
    throw error;
  }
}
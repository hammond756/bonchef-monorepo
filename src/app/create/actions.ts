"use server"

import { createClient } from "@/utils/supabase/server";
import type { Recipe } from "@/lib/types";

const RECIPE_API_URL = process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST;


const DEV_RECIPE: Recipe = {
  title: "Classic Spaghetti Bolognese",
  description: "A rich and hearty Italian pasta dish with a meaty tomato sauce.",
  total_cook_time_minutes: 60,
  n_portions: 4,
  ingredients: [
    {
      name: "Pasta",
      ingredients: [
        { description: "Spaghetti", quantity: { type: "range", low: 400, high: 400 }, unit: "gram" }
      ]
    },
    // ... existing code for other ingredient groups ...
  ],
  instructions: [
    "Fill a large pot with water, add 1-2 tablespoons of salt, and bring to a rolling boil for cooking the pasta",
    // ... existing code for other instructions ...
  ],
  thumbnail: "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO89x8AAsEB3+IGkhwAAAAASUVORK5CYII=",
  source_url: "https://www.bonchef.io",
  source_name: "BonChef"
};

interface TaskResponse {
  task_id: string;
}

interface TaskStatus {
  status: "PENDING" | "SUCCESS" | "FAILURE";
  progress: number;
  result?: Recipe;
  error?: string;
}

export type WriteStyle = "professioneel" | "thuiskok";

export async function generateRecipe(recipeText: string, writeStyle: WriteStyle) {
  if (process.env.NODE_ENV != "production" && process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true") {
    return "dev-task-id";
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const writeStyleToCreativePrompts: Record<WriteStyle, string[]> = {
    "professioneel": ["ProfessionalRecipeWriter"],
    "thuiskok": ["ClassicRecipe"]
  };
  
  const response = await fetch(`${RECIPE_API_URL}/generate/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${session?.access_token}` 
    },
    body: JSON.stringify({ 
      description: recipeText, 
      generate_image: false, 
      creative_prompts: writeStyleToCreativePrompts[writeStyle] 
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit recipe");
  }

  const data: TaskResponse = await response.json();
  return data.task_id;
}

export async function getTaskStatus(taskId: string) {
  if (process.env.NODE_ENV != "production" && process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true") {
    return {
      status: "SUCCESS",
      progress: 100,
      result: DEV_RECIPE
    };
  }
  
  const response = await fetch(`${RECIPE_API_URL}/task_status/${taskId}/`);
  
  if (!response.ok) {
    throw new Error("Failed to check task status");
  }

  return response.json() as Promise<TaskStatus>;
}

export async function scrapeRecipe(url: string) {
  const response = await fetch(`${RECIPE_API_URL}/scrape/?url=${url}`);

  if (!response.ok) {
    throw new Error(`Failed to scrape recipe: ${response.statusText}`);
  }

  const data = await response.json()
  data.thumbnail = data.source_image

  return data as Promise<Recipe>;
}
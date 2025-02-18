import { GeneratedRecipe } from "../types";

const RECIPE_API_URL = process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST;

const DEV_RECIPE: GeneratedRecipe = {
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
    {
      name: "Meat", 
      ingredients: [
        { description: "Ground beef", quantity: { type: "range", low: 500, high: 500 }, unit: "gram" }
      ]
    },
    {
      name: "Vegetables",
      ingredients: [
        { description: "Onion, finely chopped", quantity: { type: "range", low: 1, high: 1 }, unit: "whole" },
        { description: "Garlic cloves, minced", quantity: { type: "range", low: 3, high: 3 }, unit: "clove" }
      ]
    },
    {
      name: "Sauce ingredients",
      ingredients: [
        { description: "Canned crushed tomatoes", quantity: { type: "range", low: 400, high: 400 }, unit: "gram" },
        { description: "Tomato paste", quantity: { type: "range", low: 2, high: 2 }, unit: "tablespoon" },
        { description: "Red wine", quantity: { type: "range", low: 120, high: 120 }, unit: "milliliter" },
        { description: "Olive oil", quantity: { type: "range", low: 2, high: 2 }, unit: "tablespoon" }
      ]
    },
    {
      name: "Seasonings",
      ingredients: [
        { description: "Dried oregano", quantity: { type: "range", low: 1, high: 1 }, unit: "teaspoon" },
        { description: "Salt", quantity: { type: "range", low: 1, high: 1 }, unit: "teaspoon" },
        { description: "Black pepper", quantity: { type: "range", low: 0.5, high: 0.5 }, unit: "teaspoon" }
      ]
    }
  ],
  instructions: [
    "Fill a large pot with water, add 1-2 tablespoons of salt, and bring to a rolling boil for cooking the pasta",
    "Place a large, heavy-bottomed pan over medium heat and add the olive oil. Once hot, add the finely chopped onions and minced garlic, sautéing them gently until they become translucent and fragrant, about 5-7 minutes",
    "Add the ground beef to the pan, breaking it up with a wooden spoon into small, even pieces. Cook until thoroughly browned and no pink remains, about 8-10 minutes",
    "Carefully pour in the red wine, scraping the bottom of the pan to release any browned bits. Allow the wine to simmer and reduce until the alcohol has cooked off and the liquid has reduced by half, approximately 2-3 minutes",
    "Add the crushed tomatoes and tomato paste to the pan, followed by the dried oregano, salt, and freshly ground black pepper. Stir well to combine all ingredients",
    "Reduce heat to low and let the sauce simmer gently for 30 minutes, stirring every 5-7 minutes to prevent sticking. The sauce should thicken and develop a rich, deep flavor",
    "When the sauce is nearly ready, add the spaghetti to the boiling water and cook according to package instructions until al dente, typically 8-10 minutes",
    "Drain the pasta and divide among serving plates. Ladle the hot Bolognese sauce generously over each portion and finish with a liberal sprinkle of freshly grated Parmesan cheese"
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
  result?: GeneratedRecipe;
  error?: string;
}

export type WriteStyle = "professioneel" | "thuiskok";

export async function submitRecipeText(text: string, writeStyle: WriteStyle): Promise<string> {
  if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
    // Return a fake task ID in dev mode
    return "dev-task-id";
  }

  const writeStyleToCreativePrompts: Record<WriteStyle, string[]> = {
    "professioneel": ["ProfessionalRecipeWriter"],
    "thuiskok": ["ClassicRecipe"]
  }
  
  const response = await fetch(`${RECIPE_API_URL}/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: text, generate_image: false, creative_prompts: writeStyleToCreativePrompts[writeStyle] }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit recipe");
  }

  const data: TaskResponse = await response.json();
  return data.task_id;
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatus> {
  if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
    // Simulate a successful response with our dev recipe
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

  return response.json();
}
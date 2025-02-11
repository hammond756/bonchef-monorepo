import { GeneratedRecipe } from "../types";

const RECIPE_API_URL = process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST;

interface TaskResponse {
  task_id: string;
}

interface TaskStatus {
  status: "PENDING" | "SUCCESS" | "FAILURE";
  progress: number;
  result?: GeneratedRecipe;
  error?: string;
}

export async function submitRecipeText(text: string): Promise<string> {
  const response = await fetch(`${RECIPE_API_URL}/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: text }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit recipe");
  }

  const data: TaskResponse = await response.json();
  return data.task_id;
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatus> {
  const response = await fetch(`${RECIPE_API_URL}/task_status/${taskId}`);
  
  if (!response.ok) {
    throw new Error("Failed to check task status");
  }

  return response.json();
} 
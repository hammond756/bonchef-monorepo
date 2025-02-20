"use server"

import { checkTaskStatus, submitRecipeText, WriteStyle } from "@/lib/services/recipe-service"

export async function generateRecipe(recipeText: string, writeStyle: WriteStyle) {
  const recipe = await submitRecipeText(recipeText, writeStyle)
  return recipe
}

export async function getTaskStatus(taskId: string) {
  const status = await checkTaskStatus(taskId)
  return status
}
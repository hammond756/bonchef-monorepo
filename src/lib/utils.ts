import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"
import { Recipe } from "./types"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { GeneratedRecipe } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + "..."
}

export function computeMD5(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex")
}

export function generatedRecipeToRecipe(generatedRecipe: GeneratedRecipe): Recipe {
  return {
    ...generatedRecipe,
    description: "",
    thumbnail: TINY_PLACEHOLDER_IMAGE,
    source_url: "https://app.bonchef.io",
    source_name: "BonChef",
  }
}

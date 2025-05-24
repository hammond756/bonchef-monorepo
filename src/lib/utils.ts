import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"
import { Ingredient, Recipe, RecipeRead, RecipeWrite } from "./types"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { GeneratedRecipe } from "./types"
import { formatQuantity } from "format-quantity";
import { createClient } from "@/utils/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"

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

export function generatedRecipeToRecipe(generatedRecipe: GeneratedRecipe): RecipeWrite {
  return {
    ...generatedRecipe,
    description: "",
    thumbnail: TINY_PLACEHOLDER_IMAGE,
    source_url: "https://app.bonchef.io",
    source_name: "BonChef",
    // TODO: figure out how to make it optional through the zod schema
    is_public: false,
  }
}

export const unitMap = {
  gram: {
    nl: { singular: "g", plural: "g" },
    en: { singular: "g", plural: "g" },
  },
  kilogram: {
    nl: { singular: "kg", plural: "kg" },
    en: { singular: "kilogram", plural: "kilograms" },
  },
  milligram: {
    nl: { singular: "mg", plural: "mg" },
    en: { singular: "mg", plural: "mg" },
  },
  milliliter: {
    nl: { singular: "ml", plural: "ml" },
    en: { singular: "ml", plural: "ml" },
  },
  liter: {
    nl: { singular: "l", plural: "l" },
    en: { singular: "l", plural: "l" },
  },
  teaspoon: {
    nl: { singular: "tl", plural: "tl" },
    en: { singular: "tsp", plural: "tsp" },
  },
  tablespoon: {
    nl: { singular: "el", plural: "el" },
    en: { singular: "tbsp", plural: "tbsp" },
  },
  piece: {
    nl: { singular: "stuk", plural: "stukken" },
    en: { singular: "piece", plural: "pieces" },
  },
  slice: {
    nl: { singular: "plak", plural: "plakken" },
    en: { singular: "slice", plural: "slices" },
  },
  whole: {
    nl: { singular: "", plural: "" },
    en: { singular: "", plural: "" },
  },
  clove: {
    nl: { singular: "teentje", plural: "teentjes" },
    en: { singular: "clove", plural: "cloves" },
  },
  bunch: {
    nl: { singular: "bos", plural: "bossen" },
    en: { singular: "bunch", plural: "bunches" },
  },
  centimeter: {
    nl: { singular: "cm", plural: "cm" },
    en: { singular: "cm", plural: "cm" },
  },
  pinch: {
    nl: { singular: "snufje", plural: "snufjes" },
    en: { singular: "pinch", plural: "pinches" },
  },
  dash: {
    nl: { singular: "scheutje", plural: "scheutjes" },
    en: { singular: "dash", plural: "dashes" },
  },
  handful: {
    nl: { singular: "handjevol", plural: "handjevol" },
    en: { singular: "handful", plural: "handfuls" },
  },
  can: {
    nl: { singular: "blik", plural: "blikken" },
    en: { singular: "can", plural: "cans" },
  },
  jar: {
    nl: { singular: "pot", plural: "potten" },
    en: { singular: "jar", plural: "jars" },
  },
  pack: {
    nl: { singular: "pak", plural: "pakken" },
    en: { singular: "pack", plural: "packs" },
  },
  sheet: {
    nl: { singular: "vel", plural: "vellen" },
    en: { singular: "sheet", plural: "sheets" },
  },
  block: {
    nl: { singular: "blok", plural: "blokken" },
    en: { singular: "block", plural: "blocks" },
  },
  sprig: {
    nl: { singular: "takje", plural: "takjes" },
    en: { singular: "sprig", plural: "sprigs" },
  },
  scoop: {
    nl: { singular: "schep", plural: "scheppen" },
    en: { singular: "scoop", plural: "scoops" },
  },
  cup: {
    nl: { singular: "cup", plural: "cups" },
    en: { singular: "cup", plural: "cups" },
  },
  none: {
    nl: { singular: "", plural: "" },
    en: { singular: "", plural: "" },
  },
};

export function formatIngredientLine(
  ingredient: Ingredient,
  portionFactor: number,
): string {
  if (ingredient.quantity === undefined || ingredient.unit === undefined) {
    return ingredient.description;
  }

  if (ingredient.quantity.low === 0 && ingredient.quantity.high === 0) {
    return ingredient.description;
  }

  let newAmount = ingredient.quantity.low * portionFactor;

  let newUnit = ingredient.unit;

  if (
    newUnit === "kilogram" &&
    (newAmount < 1 || !Number.isSafeInteger(newAmount))
  ) {
    newUnit = "gram";
    newAmount = newAmount * 1000;
  }

  if (
    newUnit === "liter" &&
    (newAmount < 1 || !Number.isSafeInteger(newAmount))
  ) {
    newUnit = "milliliter";
    newAmount = newAmount * 1000;
  }

  if (newUnit === "milliliter" || (newUnit === "gram" && newAmount > 10)) {
    newAmount = Math.ceil(newAmount / 5) * 5;
  }

  const displayUnit =
    newAmount < 2 ? unitMap[newUnit].nl.singular : unitMap[newUnit].nl.plural;
  return `${formatQuantity(Math.round(newAmount * 100) / 100, { tolerance: 0.01 })} ${displayUnit} ${ingredient.description}`;
}

export function parseDescription(text: string): Array<{ type: "text" | "url"; content: string }> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part) => {
    if (part.match(urlRegex)) {
      return { type: "url", content: part };
    }
    return { type: "text", content: part };
  });
}

export function createProfileSlug(display_name: string | null, id: string) {
  return display_name?.toLowerCase().replace(/ /g, '-') + '~' + id
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function hostedImageToBase64(url: string): Promise<string> {
  const { data, contentType } = await hostedImageToBuffer(url)
  return `data:${contentType};base64,${data.toString("base64")}`
}

export async function hostedImageToBuffer(url: string): Promise<{data: Buffer, contentType: string, extension: string}> {
  const response = await fetch(url)
  const blob = await response.blob()
  return {
    data: Buffer.from(await blob.arrayBuffer()),
    contentType: blob.type,
    extension: blob.type.split("/")[1]
  }
}

export async function resignImageUrl(supabase: SupabaseClient, url: string): Promise<string> {
  // Parse the file storage path from the url (between /sign/${bucket}/ and ?token=)
  const [, bucket, fileStoragePath] = url.match(/\/sign\/(.*?)\/(.*?)\?token=/) || []

  if (!bucket || !fileStoragePath) {
    throw new Error("Invalid image url")
  }

  // Resign the url with the new file storage path
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fileStoragePath, 60 * 60 * 24)
  if (error) {
    throw new Error("Failed to resign image url")
  }
  return data.signedUrl
}

import { Page, expect } from "@playwright/test";

interface ImportRecipeOptions {
  page: Page;
  importMethod: "url" | "text";
  importContent: string;
}

/**
 * Imports a recipe via the UI from the import page.
 * Assumes the page is already on an import-like page (e.g., /import or /first-recipe).
 * @returns The ID of the newly created recipe draft.
 */
export async function importRecipe(options: ImportRecipeOptions): Promise<string> {
  const { page, importMethod, importContent } = options;

  if (importMethod === "url") {
    await page.getByRole("button", { name: "Site scannen" }).click();
    await page.locator("input[name='url']").fill(importContent);
  } else {
    await page.getByRole("button", { name: "Tekst invoeren" }).click();
    await page.locator("textarea[name='text']").fill(importContent);
  }

  await page.getByRole("button", { name: "Toevoegen" }).click();

  await page.waitForURL(/\/edit\//, { timeout: 60000 });
  const url = page.url();
  const recipeId = url.split("/").pop()!;
  expect(url).toContain(`/edit/${recipeId}`);

  return recipeId;
}

interface SaveRecipeOptions {
  page: Page;
  recipeId: string;
  visibility: "Privé" | "Openbaar";
}

/**
 * Saves a recipe from the edit page, handling the visibility modal.
 * Verifies that the page is redirected to the recipe detail page.
 * @param options
 */
export async function saveRecipe(options: SaveRecipeOptions): Promise<void> {
  const { page, recipeId, visibility } = options;

  await page.getByTestId("save-recipe").click();
  await page.getByText(visibility).click();
  await page.getByRole("button", { name: "Opslaan" }).click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`), { timeout: 60000 });
} 
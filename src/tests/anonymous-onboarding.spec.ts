import { test, expect } from "./fixtures";
import { importRecipe, saveRecipe } from "./utils/recipe-helpers";

test.describe("Anonymous Onboarding Flow", () => {
  test("redirects logged-in users from onboarding pages", async ({ authenticatedPage: page, baseURL }) => {
    // Attempt to visit the /welcome page
    await page.goto(`${baseURL}/welcome`);
    // Expect to be redirected to the homepage
    await expect(page).toHaveURL(`${baseURL}/ontdek`);

    // Attempt to visit the /first-recipe page
    await page.goto(`${baseURL}/first-recipe`);
    // Expect to be redirected to the homepage
    await expect(page).toHaveURL(`${baseURL}/ontdek`);
  });

  test("allows anonymous users to create, edit, and publish a recipe", async ({ page, baseURL }) => {
    // Start at the first-recipe page
    await page.goto(`${baseURL}/first-recipe`);

    const recipeId = await importRecipe({
      page,
      importMethod: "text",
      importContent: "short ribs broodje"
    });

    // Edit the recipe title
    const newTitle = "Mijn Geweldige Short Ribs Broodje";
    await page.locator("input[placeholder='Recept naam']").fill(newTitle);

    // Save the recipe
    await saveRecipe({ page, recipeId, visibility: "Openbaar" });

    // Verify the new title is on the page
    await expect(page.getByTestId("recipe-title")).toContainText(newTitle);
  });
}); 
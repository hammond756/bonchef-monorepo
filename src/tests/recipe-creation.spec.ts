import { expect, test } from "@playwright/test";

test.describe("Recipe creation flows", () => {
  test("generates recipe from description without edits", async ({ page, baseURL }) => {
    // Start from homepage
    await page.goto(baseURL!);
    await page.click("text=Voeg recept toe");
    
    // Fill in recipe description
    const description = "Een simpele pasta carbonara met spek en ei";
    await page.fill("textarea", description);
    await page.click("button:text('Maak recept')");
    
    // Wait for generation to complete and redirect
    await expect(page).toHaveURL(/\/edit\/\d+/);
    
    // Save without edits
    await page.click("button:text('Opslaan')");
    
    // Verify redirect to recipe detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("generates recipe from description with edits", async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.click("text=Voeg recept toe");
    
    // Generate recipe
    await page.fill("textarea", "Een simpele pasta carbonara");
    await page.click("button:text('Maak recept')");
    await expect(page).toHaveURL(/\/edit\/\d+/);
    
    // Add new ingredient
    await page.click("button:text('Ingredient toevoegen')");
    const lastIngredient = page.locator(".ingredients-list > div").last();
    await lastIngredient.locator("input[type='text']").fill("100");
    await lastIngredient.locator("select").selectOption("gram");
    await lastIngredient.locator("textarea").fill("parmezaanse kaas");
    
    // Edit existing ingredient quantity
    const firstIngredient = page.locator(".ingredients-list > div").first();
    await firstIngredient.locator("input[type='text']").fill("500");
    
    // Edit instruction
    const secondInstruction = page.locator(".instructions-list > div").nth(1);
    await secondInstruction.locator("textarea").fill("Bak de spekjes krokant in een pan");
    
    // Save changes
    await page.click("button:text('Opslaan')");
    
    // Verify changes on detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    await expect(page.getByText("parmezaanse kaas")).toBeVisible();
    await expect(page.getByText("500")).toBeVisible();
    await expect(page.getByText("Bak de spekjes krokant in een pan")).toBeVisible();
  });

  test("imports recipe from URL", async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.click("text=Voeg recept toe");
    
    // Switch to URL import tab
    await page.click("text=Optie 2");
    
    // Enter recipe URL
    const testUrl = "https://www.example.com/recipe";
    await page.fill("input[type='url']", testUrl);
    await page.click("button:text('Haal recept op')");
    
    // Wait for import and redirect
    await expect(page).toHaveURL(/\/edit\/\d+/);
    
    // Save without changes
    await page.click("button:text('Opslaan')");
    
    // Verify on detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
  });
}); 
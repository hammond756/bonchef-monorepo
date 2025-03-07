import { expect, test } from "@playwright/test";

test.describe("Recipe creation flows", () => {
  test("generates recipe from description without edits", async ({ page, baseURL }) => {
    await page.goto(baseURL! + "/create");
    
    // Fill in recipe description
    const description = "Een simpele pasta carbonara met spek en ei";
    await page.fill("textarea", description);
    await page.click("button:text('Maak recept')");
    
    // Wait for generation to complete and redirect
    await expect(page).toHaveURL(/\/edit\/\d+/, { timeout: 120000 });
    
    // Save without edits
    await page.click("button:text('Opslaan')");
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify redirect to recipe detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    
    // Verify private badge is visible
    await expect(page.getByText("Privé")).toBeVisible();
  });

  test("imports recipe from URL", async ({ page, baseURL }) => {
    await page.goto(baseURL! + "/create");
    
    // Switch to URL import tab
    await page.click("text=Optie 2");
    
    // Enter recipe URL
    const testUrl = "https://oohlalaitsvegan.com/vegan-pavlova/";
    await page.fill("input[type='url']", testUrl);
    await page.click("button:text('Haal recept op')");
    
    // Wait for import and redirect
    await expect(page).toHaveURL(/\/edit\/\d+/, { timeout: 120000 });
    
    // Save without changes
    await page.click("button:text('Opslaan')");
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify on detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    
    // Verify private badge is visible
    await expect(page.getByText("Privé")).toBeVisible();
  });
  
  test("creates recipe with public visibility", async ({ page, baseURL }) => {
    await page.goto(baseURL! + "/create");
    
    // Fill in recipe description
    const description = "Een openbaar recept voor iedereen om te zien";
    await page.fill("textarea", description);
    await page.click("button:text('Maak recept')");
    
    // Wait for generation to complete and redirect
    await expect(page).toHaveURL(/\/edit\/\d+/, { timeout: 120000 });
    
    // Save without edits
    await page.click("button:text('Opslaan')");
    
    // Handle visibility modal - select public
    await page.getByText("Openbaar").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify redirect to recipe detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    
    // Verify public badge is visible
    await expect(page.getByText("Openbaar")).toBeVisible();
  });
}); 
import { expect, test } from "@playwright/test";

test.describe("Recipe editing flows", () => {
  let recipeId: string;

  test.beforeAll(async ({ request, baseURL }) => {
    // Create a test recipe via API
    const response = await request.post(`${baseURL}/api/save-recipe`, {
      data: {
        title: "Test Recipe",
        description: "A recipe for testing",
        n_portions: 2,
        ingredients: [
          {
            name: "no_group",
            ingredients: [
              {
                quantity: { type: "range", low: 200, high: 200 },
                unit: "gram",
                description: "pasta"
              }
            ]
          }
        ],
        instructions: ["Cook the pasta"],
        thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA",
        total_cook_time_minutes: 10,
        source_url: "http://localhost:3000",
        source_name: "Test Recipe"
      }
    });

    const data = await response.json();
    recipeId = data.recipe.id;
  });

  test.beforeEach(async ({ page, baseURL }) => {
    // Navigate to edit page before each test
    await page.goto(`${baseURL}/edit/${recipeId}`);
  });

  test.afterAll(async ({ request, baseURL }) => {
    // Cleanup: delete test recipe
    await request.delete(`${baseURL}/api/recipes/${recipeId}`);
  });

  test("edits recipe title and description", async ({ page }) => {
    // Edit basic details
    await page.fill("input[placeholder='Recept naam']", "Verbeterde Pasta Carbonara");
    await page.fill("textarea[placeholder='Beschrijving']", 
      "Een luxe versie van pasta carbonara met verse ingrediënten"
    );
    
    await page.click("button:text('Opslaan')");
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify changes on detail page
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByText("Verbeterde Pasta Carbonara")).toBeVisible();
    await expect(page.getByText("Een luxe versie van pasta carbonara")).toBeVisible();
  });

  test("updates portion size", async ({ page }) => {
    // Change portion size
    await page.fill("input[placeholder='Porties']", "4");
    await page.click("button:text('Opslaan')");
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify on detail page
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByText("4 porties")).toBeVisible();
  });

  test("manages ingredients - add, edit, remove", async ({ page }) => {
    // Add new ingredient
    await page.getByTestId("add-ingredient").click();
    
    // Get the last ingredient in the list
    const newIngredient = page.locator("[data-testid='ingredient-item']").last();
    await newIngredient.getByTestId("ingredient-quantity").fill("50");
    await newIngredient.locator("select").selectOption("milliliter");
    await newIngredient.getByTestId("ingredient-description").fill("witte wijn");
    
    // Edit existing ingredient
    const firstIngredient = page.locator("[data-testid='ingredient-item']").first();
    await firstIngredient.getByTestId("ingredient-quantity").fill("400");
    await firstIngredient.getByTestId("ingredient-description").fill("spaghetti");
    
    await page.getByTestId("save-recipe").click();
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify changes
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByText("50 milliliter witte wijn")).toBeVisible();
    await expect(page.getByText("400 gram spaghetti")).toBeVisible();
  });

  test("manages instructions - add, edit, remove", async ({ page }) => {
    // Add new instruction
    await page.getByTestId("add-instruction").click();
    const instructions = page.locator("textarea").filter({ hasText: /.*/ });
    await instructions.last().fill("Schenk een glas witte wijn in voor de kok");
    
    // Edit existing instruction
    await instructions.first().fill("Kook de pasta volgens de verpakking al dente");
    
    await page.getByTestId("save-recipe").click();
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify changes
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByText("Kook de pasta volgens de verpakking al dente")).toBeVisible();
    await expect(page.getByText("Schenk een glas witte wijn in voor de kok")).toBeVisible();
  });

  test("handles image upload", async ({ page }) => {
    // Upload image file
    await page.setInputFiles("input[type='file']", "playwright/test-fixtures/recipe-image.png");
    
    await page.getByTestId("save-recipe").click();
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify image is displayed
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByTestId("recipe-image")).toBeVisible();   
  });

  test("generates new recipe image", async ({ page }) => {
    // Click generate image button
    await page.getByTestId("generate-image-button").click();

    // Wait for modal to appear
    await expect(page.getByText("Afbeelding instellingen")).toBeVisible();
    
    // Select camera angle and kitchen style
    await page.getByText("Top-down perspectief").click();
    await page.getByText("Minimalistisch wit").click();
    
    // Click generate button
    await page.getByRole("button", { name: "Genereer" }).click();
    
    // Wait for generation to complete with 2 minute timeout
    await expect(
      page.getByText("Afbeelding genereren...")
    ).not.toBeVisible({ timeout: 120000 }); // 2 minutes in milliseconds
    
    await expect(
      page.getByTestId("recipe-image-preview")
    ).toBeVisible({ timeout: 120000 });
    
    await page.getByTestId("save-recipe").click();
    
    // Handle visibility modal
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify image persists after save
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect(page.getByTestId("recipe-image")).toBeVisible();
  });

  test("deletes recipe", async ({ page, baseURL }) => {
    // Click delete button
    await page.getByTestId("delete-recipe").click();
    
    // Verify redirect to homepage
    await expect(page).toHaveURL(baseURL!);
    
    // Verify recipe no longer exists
    await page.goto(`${baseURL}/recipes/${recipeId}`);
    await expect(page.getByText("Recept niet gevonden")).toBeVisible();
    await expect(page.getByText("Terug naar homepage")).toBeVisible();
  });

  test("toggles recipe visibility", async ({ page }) => {
    // Create a new recipe for this test
    await page.goto(`/edit/${recipeId}`);
    
    // Save with private visibility first
    await page.getByTestId("save-recipe").click();
    await page.getByText("Privé").click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    
    // Verify private badge is visible
    await expect(page.getByText("Privé")).toBeVisible();
    
    // Edit the recipe again
    await page.click("text=Bewerk recept");
    
    // Save with public visibility
    await page.getByTestId("save-recipe").click();
    await page.getByText("Openbaar").click();
    await page.getByRole("button", { name: "Opslaan" }).click();

    await page.waitForURL(new RegExp(`/recipes/${recipeId}`));
    
    // Verify public badge is visible
    await expect(page.getByText("Openbaar")).toBeVisible();
  });
}); 
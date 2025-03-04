import { expect, test } from "@playwright/test";
import path from "path";

// Test suite for recipe visibility features
test.describe("Recipe visibility features", () => {
  let publicRecipeId: string;
  let privateRecipeId: string;
  
  // Create test recipes before all tests with first user
  test.beforeAll(async ({ request, baseURL }) => {
    // Create a public test recipe
    const publicResponse = await request.post(`${baseURL}/api/save-recipe`, {
      data: {
        title: "Public Test Recipe",
        description: "A public recipe for testing visibility",
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
        thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAA",
        total_cook_time_minutes: 10,
        source_url: "http://localhost:3000",
        source_name: "Public Test Recipe",
        is_public: true
      }
    });

    const publicData = await publicResponse.json();
    publicRecipeId = publicData.recipe.id;

    // Create a private test recipe
    const privateResponse = await request.post(`${baseURL}/api/save-recipe`, {
      data: {
        title: "Private Test Recipe",
        description: "A private recipe for testing visibility",
        n_portions: 2,
        ingredients: [
          {
            name: "no_group",
            ingredients: [
              {
                quantity: { type: "range", low: 200, high: 200 },
                unit: "gram",
                description: "rice"
              }
            ]
          }
        ],
        instructions: ["Cook the rice"],
        thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAA",
        total_cook_time_minutes: 15,
        source_url: "http://localhost:3000",
        source_name: "Private Test Recipe",
        is_public: false
      }
    });

    const privateData = await privateResponse.json();
    privateRecipeId = privateData.recipe.id;
  });

  // Clean up test recipes after all tests
  test.afterAll(async ({ request, baseURL }) => {
    // Delete test recipes
    await request.delete(`${baseURL}/api/recipes/${publicRecipeId}`);
    await request.delete(`${baseURL}/api/recipes/${privateRecipeId}`);
  });

  // Test recipe visibility for first user (owner)
  test.describe("First user (owner) recipe visibility", () => {
    test("can view own public recipe", async ({ page, baseURL }) => {
      // Access public recipe
      await page.goto(`${baseURL}/recipes/${publicRecipeId}`);
      
      // Verify recipe is visible
      await expect(page.getByText("Public Test Recipe")).toBeVisible();
      await expect(page.getByText("A public recipe for testing visibility")).toBeVisible();
      
      // Verify public badge is visible
      await expect(page.getByText("Openbaar")).toBeVisible();
    });
    
    test("can view own private recipe", async ({ page, baseURL }) => {
      // Access private recipe
      await page.goto(`${baseURL}/recipes/${privateRecipeId}`);
      
      // Verify recipe is visible
      await expect(page.getByText("Private Test Recipe")).toBeVisible();
      await expect(page.getByText("A private recipe for testing visibility")).toBeVisible();
      
      // Verify private badge is visible
      await expect(page.getByText("Privé")).toBeVisible();
    });
  });

  // Test recipe visibility for second user (non-owner)
  test.describe("Second user (non-owner) recipe visibility", () => {
    // Use a separate test for second user with its own browser context
    const secondUserAuthFile = path.join(__dirname, "../../playwright/.auth/user2.json");
    
    test("can view first user's public recipe", async ({ browser, baseURL }) => {
      // Create a new context with second user authentication
      const context = await browser.newContext({
        storageState: secondUserAuthFile
      });
      const page = await context.newPage();
      
      try {
        // Access first user's public recipe
        await page.goto(`${baseURL}/recipes/${publicRecipeId}`);
        
        // Verify recipe is visible
        await expect(page.getByText("Public Test Recipe")).toBeVisible();
        await expect(page.getByText("A public recipe for testing visibility")).toBeVisible();
        
        // Verify public badge is visible
        await expect(page.getByText("Openbaar")).toBeVisible();
      } finally {
        await context.close();
      }
    });
    
    test("cannot view first user's private recipe", async ({ browser, baseURL }) => {
      // Create a new context with second user authentication
      const context = await browser.newContext({
        storageState: secondUserAuthFile
      });
      const page = await context.newPage();
      
      try {
        // Try to access first user's private recipe
        await page.goto(`${baseURL}/recipes/${privateRecipeId}`);
        
        // Verify recipe not found message
        await expect(page.getByText("Recept niet gevonden")).toBeVisible();
      } finally {
        await context.close();
      }
    });
  });

  // Test recipe visibility for anonymous users
  test.describe("Anonymous user recipe visibility", () => {
    test.beforeEach(async ({ context }) => {
        // Use no authentication
        await context.clearCookies();
      });
      test("can view public recipe", async ({ page, baseURL }) => {
        // Try to access public recipe
        await page.goto(`${baseURL}/recipes/${publicRecipeId}`);
        
        // Verify recipe is visible
        await expect(page.getByText("Public Test Recipe")).toBeVisible();
        await expect(page.getByText("A public recipe for testing visibility")).toBeVisible();
    });
    
    test("cannot view private recipe and is redirected to login", async ({ page, baseURL }) => {
        // Try to access private recipe
        await page.goto(`${baseURL}/recipes/${privateRecipeId}`);

        // Verify recipe not found message
        await expect(page.getByText("Recept niet gevonden")).toBeVisible();
    });
  });
}); 
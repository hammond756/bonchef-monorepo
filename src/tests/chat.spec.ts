import { expect, test } from "@playwright/test";

test.describe("Chat interface", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test("sends message and gets recipe response", async ({ page }) => {
    const message = "Ik wil een pasta carbonara maken";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });

    // Wait for response
    await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");
});

  test("saves recipe to collection from chat", async ({ page, context }) => {
    const message = "Geef me een recept voor lasagne";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });
    // Wait for response
    await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");

    // Create a promise to wait for the new page
    const pagePromise = context.waitForEvent("page");

    // Click save button
    await page.click("[data-testid='save-recipe-button']");

    // Wait for the save view button to be visible
    const saveViewButton = page.getByTestId("save-view-button");
    await saveViewButton.waitFor({ state: "visible" });
    await saveViewButton.click();

    // Wait for the new page to open
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Verify we're on a recipe detail page
    expect(newPage.url()).toMatch(/\/recipes\/\d+/);
  });

  test("gets recipe response using 'verras me'", async ({ page }) => {
    await page.click("[data-testid='surprise-me']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });

    // Wait for response
    await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");
  });

  test("persists messages after page refresh", async ({ page }) => {
    const message = "Geef me een recept voor tiramisu";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });

    // Wait for response
    await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");

    // Store the response text
    const responseText = await page.getByTestId("chat-message").last().textContent();

    // Refresh the page
    await page.reload();

    // Verify message and response are still visible
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByTestId("chat-message").last()).toContainText(responseText!);
  });

  test("resets chat state with 'opnieuw beginnen'", async ({ page }) => {
    const message = "Geef me een recept voor pizza";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });
    // Wait for response
    await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");
    // Click reset button
    await page.click("[data-testid='reset-chat']");

    // Verify chat is reset
    await expect(page.getByTestId("chat-message").last()).not.toBeVisible();
    await expect(page.getByText(message)).not.toBeVisible();
    await expect(page.getByTestId("chat-input")).toHaveValue("");
  });

  test("expands and focuses chat input on 'Beschrijf een recept'", async ({ page }) => {
    // Initial state check
    const input = page.getByTestId("chat-input");
    await expect(input).toHaveAttribute("rows", "1");
    await expect(input).toHaveClass(/min-h-\[36px\]/);

    // Trigger expansion
    await page.click("text=Beschrijf een recept");

    // Verify expanded state
    await expect(input).toBeFocused();
    await expect(input).toHaveClass(/min-h-\[144px\]/);
    await expect(input).toHaveClass(/max-h-\[144px\]/);
    await expect(input).toHaveClass(/transition-all/);

    // Verify it stays expanded when typing
    await input.type("Test message");
    await expect(input).toHaveClass(/min-h-\[144px\]/);
  });

  test("expands and focuses chat input on 'Importeer een recept'", async ({ page }) => {
    // Initial state check
    const input = page.getByTestId("chat-input");
    await expect(input).toHaveAttribute("rows", "1");
    await expect(input).toHaveClass(/min-h-\[36px\]/);

    // Trigger expansion
    await page.click("text=Importeer een recept");

    // Verify expanded state
    await expect(input).toBeFocused();
    await expect(input).toHaveClass(/min-h-\[144px\]/);
    await expect(input).toHaveClass(/max-h-\[144px\]/);
    await expect(input).toHaveClass(/transition-all/);
  });

  test("expands textarea based on content conditions", async ({ page }) => {
    const input = page.getByTestId("chat-input");
    
    // Initial state
    await expect(input).toHaveClass(/min-h-\[36px\]/);

    // Test expansion on long content (>100 chars)
    await input.type("A".repeat(101));
    await expect(input).toHaveClass(/min-h-\[144px\]/);
  });

  test("maintains expanded state until form submission", async ({ page }) => {
    const input = page.getByTestId("chat-input");
    
    // Expand textarea
    await page.click("text=Beschrijf een recept");
    await expect(input).toHaveClass(/min-h-\[144px\]/);

    // Type and submit
    await input.type("Test message");
    await page.click("[data-testid='send-button']");

    // Verify collapse after submission
    await expect(input).toHaveClass(/min-h-\[36px\]/);
    await expect(input).toHaveValue("");
  });

  test("handles focus and blur states correctly", async ({ page }) => {
    const input = page.getByTestId("chat-input");
    
    // Initial state
    await expect(input).toHaveClass(/min-h-\[36px\]/);

    // Focus expands
    await input.focus();
    await expect(input).toHaveClass(/min-h-\[144px\]/);

    // Blur maintains expansion if there's content
    await input.type("Some content");
    await input.evaluate(e => e.blur());
    await expect(input).toHaveClass(/min-h-\[144px\]/);

    // Clear and blur collapses
    await input.fill("");
    await input.evaluate(e => e.blur());
    await expect(input).toHaveClass(/min-h-\[36px\]/);
  });

  test("displays pasted URL with checkmark", async ({ page }) => {
    const url = "https://www.example.com/recipe";
    await page.fill("[data-testid='chat-input']", url);

    // Verify URL display
    await expect(page.getByTestId("url-preview")).toBeVisible();
    await expect(page.getByTestId("url-preview-text")).toContainText(url);
    await expect(page.getByTestId("url-loading-spinner")).toBeVisible();
    await expect(page.getByTestId("url-checkmark")).toBeVisible({ timeout: 30000 });
  });

  test("disables submit during URL processing", async ({ page }) => {
    const url = "https://www.example.com/recipe";
    await page.fill("[data-testid='chat-input']", url);

    // Verify submit button is disabled during loading
    await expect(page.getByTestId("send-button")).toBeDisabled();

    // Wait for URL processing to complete
    await expect(page.getByTestId("url-checkmark")).toBeVisible();

    // Verify submit button is enabled after loading
    await expect(page.getByTestId("send-button")).toBeEnabled();
  });
});

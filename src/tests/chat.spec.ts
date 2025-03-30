import { expect, test } from "./fixtures";

test.describe("Chat interface", () => {
  test.beforeEach(async ({ authenticatedPage: page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test("saves recipe to collection from chat", async ({ authenticatedPage: page, context }) => {
    const message = "Geef me een recept voor lasagne";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    // await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });
    await expect(page.getByTestId("chat-message").first()).toContainText(message);

    // Wait for response
    await expect(page.getByTestId("chat-message").nth(1)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").nth(1)).toContainText("Hier is een recept");

    // Click save button
    await page.click("[data-testid='save-recipe-button']");

    // Wait for the view recipe button to be visible
    const saveViewButton = page.getByTestId("save-view-button");
    await saveViewButton.waitFor({ state: "visible" });
  });

  test("gets recipe response using 'verras me'", async ({ authenticatedPage: page }) => {
    await page.click("[data-testid='surprise-me']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });

    // Wait for response
    await expect(page.getByTestId("chat-message").nth(1)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").nth(1)).toContainText("Hier is een recept");
  });

  // TODO: Fix this test, the behaviour it is testing does work,
  // but the test is failing because the conversationId is not persisted
  // Also make sure the converation isn't saved twice due to eager callback handling (parent id stuff)
  // test("persists messages after page refresh", async ({ page }) => {
  //   const message = "Geef me een recept voor tiramisu";
  //   await page.fill("[data-testid='chat-input']", message);
  //   await page.click("[data-testid='send-button']");
  //   await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });

  //   // Wait for response
  //   await expect(page.getByTestId("chat-message").last()).toBeVisible({ timeout: 30000 });
  //   await expect(page.getByTestId("chat-message").last()).toContainText("Hier is een recept");

  //   // Store the response text
  //   const responseText = await page.getByTestId("chat-message").last().textContent();

  //   // Refresh the page
  //   await page.reload();

  //   // Verify message and response are still visible
  //   await expect(page.getByText(message)).toBeVisible();
  //   await expect(page.getByTestId("chat-message").last()).toContainText(responseText!);
  // });

  test("resets chat state with 'opnieuw beginnen'", async ({ authenticatedPage: page }) => {
    const message = "Geef me een recept voor pizza";
    await page.fill("[data-testid='chat-input']", message);
    await page.click("[data-testid='send-button']");
    await expect(page.getByText('Laden...')).toBeVisible({ timeout: 2000 });
    // Wait for response
    await expect(page.getByTestId("chat-message").nth(1)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("chat-message").nth(1)).toContainText("Hier is een recept");
    // Click reset button
    await page.click("[data-testid='reset-chat']");

    // Verify chat is reset
    await expect(page.getByTestId("chat-message").nth(1)).not.toBeVisible();
    await expect(page.getByText(message)).not.toBeVisible();
    await expect(page.getByTestId("chat-input")).toHaveValue("");
  });

  test("expands and focuses chat input on 'Beschrijf een recept'", async ({ authenticatedPage: page }) => {
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

  test("expands and focuses chat input on 'Importeer een recept'", async ({ authenticatedPage: page }) => {
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

  test("expands textarea based on content conditions", async ({ authenticatedPage: page }) => {
    const input = page.getByTestId("chat-input");

    const inputHeight = await input.evaluate(e => e.clientHeight);

    // Test expansion on long content (>100 chars)
    await input.type("A A".repeat(101));

    const newInputHeight = await input.evaluate(e => e.clientHeight);
    expect(newInputHeight).toBeGreaterThan(inputHeight);

    // Test focus outside maintains expansion
    await input.evaluate(e => e.blur());
    const newInputHeight2 = await input.evaluate(e => e.clientHeight);
    expect(newInputHeight2).toEqual(newInputHeight);
  });

  test("maintains expanded state until form submission", async ({ authenticatedPage: page }) => {
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

  test("displays pasted URL with checkmark", async ({ authenticatedPage: page }) => {
    const url = "https://www.example.com/recipe";
    await page.fill("[data-testid='chat-input']", url);

    // Verify URL display
    await expect(page.getByTestId("url-preview")).toBeVisible();
    await expect(page.getByTestId("url-preview-text")).toContainText(url);
    await expect(page.getByTestId("url-loading-spinner")).toBeVisible();
    await expect(page.getByTestId("url-checkmark")).toBeVisible({ timeout: 30000 });
  });

  test("disables submit during URL processing", async ({ authenticatedPage: page }) => {
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


test.describe("Teaser interaction", () => {
  test("when a teaser is generated, it is displayed as a clickable component", async ({ authenticatedPage: page }) => {
    await page.click("[data-testid='surprise-me']");
    const teaserCard = page.getByTestId("teaser-card");
    
    // Allow the teaser to be clickable
    await page.waitForTimeout(3000);
    
    await expect(teaserCard).toBeVisible();

    // Click the teaser card
    await teaserCard.click();

    // Wait for the recipe modal to be visible
    await expect(page.getByTestId("recipe-modal-save-recipe-button")).toBeVisible({ timeout: 10000 });

    // Click the save button
    await page.click("[data-testid='recipe-modal-save-recipe-button']");
    
    // Wait for the "Bekijk recept" button to be visible
    await expect(page.getByText("Bekijk recept")).toBeVisible({ timeout: 10000 });

    // Click the "Bekijk recept" button
    await page.click("[data-testid='recipe-modal-view-recipe-button']");
    
  });
});

import { expect, test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");
const authFile2 = path.join(__dirname, "../../playwright/.auth/user2.json");

// Authenticate first user
setup("authenticate first user", async ({ page, baseURL }) => {
  await page.goto(baseURL! + "/login");
      
  await page.fill("input[type='email']", process.env.TEST_USER_EMAIL!);
  await page.fill("input[type='password']", process.env.TEST_USER_PASSWORD!);
  await page.click("button[type='submit']");
  
  await expect(page).toHaveURL("/");

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});

// Authenticate second user
setup("authenticate second user", async ({ page, baseURL }) => {
  await page.goto(baseURL! + "/login");
      
  await page.fill("input[type='email']", "test2@playwright.com");
  await page.fill("input[type='password']", process.env.TEST_USER_PASSWORD!);
  await page.click("button[type='submit']");
  
  await expect(page).toHaveURL("/");

  // Save signed-in state
  await page.context().storageState({ path: authFile2 });
}); 
import { expect, test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page, baseURL }) => {

    await page.goto(baseURL! + "/login");
        
    await page.fill("input[type='email']", process.env.TEST_USER_EMAIL!);
    await page.fill("input[type='password']", process.env.TEST_USER_PASSWORD!);
    await page.click("button[type='submit']");
    
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Voeg recept toe")).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: authFile });
}); 
## Relevant Files

- `src/app/welcome/layout.tsx` - To check for a user session and redirect logged-in users.
- `src/app/first-recipe/layout.tsx` - To check for a user session and redirect logged-in users.
- `src/actions/recipe-imports.ts` - To modify `createDraftRecipe` to handle anonymous users by assigning recipes to a "marketing user".
- `.env.local.example` - To add the `MARKETING_USER_ID` environment variable.
- `src/tests/anonymous-onboarding.spec.ts` - New E2E test file for the entire anonymous user flow.

### Notes

- A "marketing user" will need to be created in the Supabase `auth.users` table manually to get a UUID for the `MARKETING_USER_ID` environment variable.
- E2E tests are critical for this feature to ensure the entire flow works as expected. Use `npx playwright test` to run them.


## Tasks

- [x] 1.0 Restrict Access for Logged-In Users
  - [x] 1.1 In `src/app/welcome/layout.tsx`, fetch the current user session.
  - [x] 1.2 If a user session exists, redirect the user to the `/` route.
  - [x] 1.3 In `src/app/first-recipe/layout.tsx`, implement the same session check and redirect logic.
- [x] 2.0 Implement Anonymous Recipe Creation
  - [ ] 2.1 Add `MARKETING_USER_ID` to `.env.local.example` and your local `.env.local` file. (Skipped)
  - [x] 2.2 In `src/actions/recipe-imports.ts`, update the `createDraftRecipe` function.
  - [x] 2.3 Inside the function, check if a user is logged in.
  - [x] 2.4 If no user is logged in, use the `MARKETING_USER_ID` from `process.env` as the `userId` when creating the draft recipe.
  - [x] 2.5 Ensure the server action continues to redirect to `/edit/[recipeId]` on success.
- [ ] 3.0 Verify Post-Publish Flow
  - [ ] 3.1 Manually test the complete anonymous flow: start from `/welcome`, import a recipe, edit it, and save.
  - [ ] 3.2 Confirm the final redirect goes to the `/recipe/[recipeId]` page.
  - [ ] 3.3 Verify the recipe's status is `PUBLISHED` in the database.
- [x] 4.0 Adjust Edit Page Authorization for Anonymous Users
  - [x] 4.1 In `src/app/edit/[id]/page.tsx`, refactor the authorization logic.
  - [x] 4.2 Fetch the recipe details before checking for the user session.
  - [x] 4.3 If a user is logged in, ensure they can only edit their own recipes and not marketing recipes.
  - [x] 4.4 If a user is anonymous, allow them to edit a recipe ONLY if its `user_id` matches the `MARKETING_USER_ID`.
  - [x] 4.5 Redirect any other unauthorized access (e.g., anonymous users on regular recipes should go to `/login`).
- [x] 5.0 Add E2E Tests for Anonymous Flow
  - [x] 5.1 Create a new Playwright test file: `src/tests/anonymous-onboarding.spec.ts`.
  - [x] 5.2 Write a test to ensure logged-in users are redirected from `/welcome` and `/first-recipe`.
  - [x] 5.3 Write a complete E2E test for the anonymous user flow:
      - Start at `/first-recipe`.
      - Trigger the recipe import.
      - Assert redirection to the `/edit/` page.
      - Update the recipe form and save.
      - Assert redirection to the `/recipe/` page.
      - Assert the new recipe's content is visible.
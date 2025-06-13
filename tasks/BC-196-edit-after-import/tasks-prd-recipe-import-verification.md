## Relevant Files

-   `src/app/import/page.tsx` - **(High Priority)** The main entry point for all import flows. The `submitUrl`, `submitImage`, and `submitText` functions here will be the starting point for the changes.
-   `src/components/url-dialog.tsx` - The dialog for URL imports, which triggers the submit action.
-   `src/components/text-dialog.tsx` - The dialog for text imports.
-   `src/components/image-dialog.tsx` - The dialog for image imports.
-   `src/lib/recipes/actions.ts` - Server actions where the new `createDraftRecipe` and `updateRecipe` logic will live.
-   `src/app/edit/[id]/page.tsx` - The main page for editing, which will be adapted for the new flow.
-   `src/components/recipe-form.tsx` - The core form component for editing.
-   `src/hooks/use-unsaved-changes-warning.ts` - A custom hook to warn users about unsaved changes.
-   `src/tests/recipe-editing.spec.ts` - **(High Priority)** The existing E2E test file where new tests for this flow will be added.

### Notes

-   E2E tests are preferred. Focus on adding comprehensive tests to `src/tests/recipe-editing.spec.ts` to cover the new user journey.
-   Use `npx playwright test --headed` to run tests in a browser and observe the behavior.

## Tasks

-   [x] **1.0 Prepare Database for Drafts**
    -   [x] 1.1 Create a new database migration using the Supabase CLI: `supabase migrations new add_status_to_recipes`.
    -   [x] 1.2 In the generated migration file, add a `status` column to the `recipes` table. The column should be of type `text`, have a `NOT NULL` constraint, and its default value should be `'DRAFT'`.
    -   [x] 1.3 To ensure existing recipes are not affected, add an `UPDATE` statement to the migration to set the `status` of all current recipes to `'PUBLISHED'`.
    -   [x] 1.4 Apply the migration to the local database using `supabase migrations up`.

-   [x] **2.0 Create Draft Recipe on Import**
    -   [x] 2.1 In `src/lib/recipes/actions.ts`, create a new server action `createDraftRecipe`. This action will accept parsed recipe data, save it to the database (the status will default to `'DRAFT'`), and return the newly created `recipe.id`.
    -   [x] 2.2 In `src/app/import/page.tsx`, modify the `submitUrl`, `submitImage`, and `submitText` functions. Instead of calling `saveRecipe` and redirecting to the recipe view page, they should now call `createDraftRecipe`.
    -   [x] 2.3 After `createDraftRecipe` returns the new recipe `id`, redirect the user to `/edit/[id]`.

-   [x] **3.0 Adapt Edit Page for Draft Recipes**
    -   [x] 3.1 Modify the data fetching logic in `src/app/edit/[id]/page.tsx` to retrieve recipes regardless of their `status` (`DRAFT` or `PUBLISHED`).
    -   [x] 3.2 Pass the fetched recipe data down to the `RecipeEditForm` component.

-   [x] **4.0 Implement "Save" and "Cancel" Logic**
    -   [x] 4.1 In `src/lib/recipes/actions.ts`, create or update the `updateRecipe` action. When a recipe is saved from the edit page, this action should update its data and change its `status` from `'DRAFT'` to `'PUBLISHED'`.
    -   [x] 4.2 Implement the "Opslaan" (Save) button's `onClick` handler in the `recipe-edit-form.tsx` to call the `updateRecipe` action and redirect to the recipe view page on success.
    -   [x] 4.3 Implement the "Annuleren" (Cancel) button. It should navigate the user to the previous page in their browser history.
    -   [x] 4.4 **(Conditional Logic)** If the user cancels *and* the recipe being edited has a `status` of `'DRAFT'`, call a `deleteRecipe` action to remove the draft from the database before navigating away.
    -   [x] 4.5 Add a confirmation dialog that appears only when a user clicks "Annuleren" with unsaved changes.

-   [x] **5.0 Implement Unsaved Changes Warning**
    -   [x] 5.1 Create the `useUnsavedChangesWarning` custom hook that takes the form's "dirty" state as an argument.
    -   [x] 5.2 The hook should use the `beforeunload` event to prompt the user with a native browser warning if they attempt to navigate away while the form is dirty.
    -   [x] 5.3 Integrate the `useUnsavedChangesWarning` hook into the `RecipeEditForm` component.

-   [x] **6.0 Write E2E Tests**
    -   [x] 6.1 In `src/tests/recipe-editing.spec.ts`, add a new test suite for the import-and-edit flow.
    -   [x] 6.2 Write a test that imports a recipe from a URL, verifies it redirects to `/edit/[id]`, makes a small change (e.g., to the title), saves it, and confirms the change on the recipe view page.
    -   [x] 6.3 Write a test where a user imports a recipe, makes an edit, and then clicks "Annuleren". Verify the confirmation dialog appears and that the draft recipe is deleted upon confirmation.
    -   [x] 6.4 Write a test to ensure the browser's "unsaved changes" warning is triggered when attempting to close the page after an edit. 
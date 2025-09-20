## Relevant Files

- `supabase/migrations/....sql` - New database migration file to create the `recipe_import_jobs` table.
- `src/lib/types.ts` - To add the `RecipeImportJob` interface.
- `src/actions/recipe-imports.ts` - To create the new background server action while preserving the original synchronous functions.
- `src/app/import/page.tsx` - To update the form submission logic for authenticated users to be non-blocking.
- `src/app/first-recipe/page.tsx` - To verify this page retains its original synchronous logic for anonymous users.
- `src/app/collection/page.tsx` - To fetch and display jobs, drafts, and published recipes for logged-in users.
- `src/components/recipe/recipe-card.tsx` - To add the "Draft" state indicator.
- `src/components/recipe/in-progress-recipe-card.tsx` - **New file:** A component to display the placeholder for jobs being processed.

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx playwright test [optional/path/to/test/file]` to run tests.

## Tasks

- [x] **1.0 Database & Types:** Create the `recipe_import_jobs` table and define related TypeScript types.
    - [x] 1.1 Use the Supabase CLI to create a new migration file: `supabase migrations new create_recipe_import_jobs_table`.
    - [x] 1.2 In the new migration file, write the SQL to create the `recipe_import_jobs` table. The schema should include `id`, `user_id`, `status`, `source_type`, `source_data`, `recipe_id`, and auto-updating `created_at` and `updated_at` timestamp columns.
    - [x] 1.3 Add a `RecipeImportJob` interface in `src/lib/types.ts` that matches the new database table structure.
- [x] **2.0 Backend Logic:** Implement the server-side action for asynchronous recipe generation.
    - [x] 2.1 In `src/actions/recipe-imports.ts`, create a new server action `startRecipeImportJob(sourceType, sourceData)`.
    - [x] 2.2 This action will first create a record in the `recipe_import_jobs` table with `status: 'pending'`.
    - [x] 2.3 The action will then trigger the recipe generation process (e.g., `scrapeRecipe`, `generateRecipeFromImage`) _without_ being awaited by the client.
    - [x] 2.4 Upon successful generation, the logic should create a new recipe with `status: 'DRAFT'`, passing the `created_at` timestamp from the job to the new recipe to maintain chronological order.
    - [x] 2.5 Update the `recipe_import_jobs` record to `status: 'completed'` and link the new `recipe_id`.
    - [x] 2.6 Implement `try/catch` error handling. On failure, update the job record to `status: 'failed'` and store the `error_message`.
- [x] **3.0 Frontend Submission:** Update the form submission logic based on the user's authentication state.
    - [x] 3.1 In `src/app/import/page.tsx` (for authenticated users), refactor the `submitUrl`, `submitImage`, and `submitText` functions.
    - [x] 3.2 These functions should now call the new `startRecipeImportJob` action and immediately redirect the user to the `/collection` page.
    - [x] 3.3 In `src/app/first-recipe/page.tsx` (for anonymous users), confirm that the submission logic remains synchronous and continues to call the original blocking recipe generation functions. No changes should be needed here, but verification is required.
- [x] **4.0 Collection Page UI:** Rework the "Mijn recepten" page to display in-progress, draft, and published recipes.
    - [x] 4.1 Modify the data fetching logic in `src/app/collection/page.tsx` to retrieve both the user's recipes and their pending `recipe_import_jobs`.
    - [x] 4.2 Create the new `InProgressRecipeCard.tsx` component to render a greyed-out, non-interactive card displaying the import source.
    - [x] 4.3 Update `RecipeCard.tsx` to include a visual indicator (e.g., a "Draft" badge) when a recipe's status is `DRAFT`.
    - [x] 4.4 On the collection page, merge and sort the two lists (jobs first) and render the appropriate card for each item.
    - [x] 4.5 Implement a polling mechanism using SWR to automatically update the status of jobs on the collection page.
    - [x] 4.6 Use the `useToast` hook to display a notification when a job fails, based on the polled data.

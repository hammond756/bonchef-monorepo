## Relevant Files

- `src/app/recipes/preview/[id]/page.tsx` - **New file**. The dedicated preview page for recipes created during onboarding.
- `src/app/recipes/preview/[id]/actions.ts` - **New file**. Contains the server action to fetch recipe data for the preview page.
- `src/utils/supabase/server.ts` - Contains the existing `createAdminClient()` needed to bypass RLS.
- `src/components/recipe-form.tsx` - To modify the redirect logic to point to the new preview page.
- `src/app/first-recipe/page.tsx` - To pass a prop to `RecipeForm` indicating it's used in the onboarding flow.

### Notes

- The `MARKETING_USER_ID` will need to be available as an environment variable (e.g., `NEXT_PUBLIC_MARKETING_USER_ID`) to be used in the data fetching logic.
- Use `npx jest [optional/path/to/test/file]` to run tests.

## Tasks

- [x] 1.0 **Backend: Implement Preview Recipe Data Fetching**
    - [x] 1.1 Create a new file `src/app/recipes/preview/[id]/actions.ts`.
    - [x] 1.2 Create an exported server action `getPreviewRecipe(recipeId: string)`.
    - [x] 1.3 Inside the action, import and use `createAdminClient()` from `src/utils/supabase/server.ts` to create a Supabase client that can bypass RLS.
    - [x] 1.4 Use this admin client to query the `recipes` table. The query must select the recipe where `id` matches `recipeId` AND `user_id` matches the marketing user's ID.
    - [x] 1.5 The query should fetch the recipe regardless of its `is_public` status.
    - [x] 1.6 Return the recipe data if found, otherwise return `null`.

- [x] 2.0 **Frontend: Create the Dedicated Recipe Preview Page**
    - [x] 2.1 Create a new page file at `src/app/recipes/preview/[id]/page.tsx`.
    - [x] 2.2 The page component should take `params` (for `id`) as a prop.
    - [x] 2.3 Call the `getPreviewRecipe` server action with the `id` from `params`.
    - [x] 2.4 If the recipe is not found, render a "Recipe Not Found" message or redirect.
    - [x] 2.5 If the recipe is found, render the recipe details. You can reuse the existing `RecipeDetail` component for consistency.
    - [x] 2.6 Add a simple layout file `src/app/recipes/preview/[id]/layout.tsx` if needed.

- [ ] 3.0 **Frontend: Update Recipe Form Redirect Logic**
    - [ ] 3.1 In `src/app/first-recipe/page.tsx`, find the `<RecipeForm />` component and pass a new boolean prop: `isOnboardingFlow={true}`.
    - [ ] 3.2 In `src/components/recipe-form.tsx`, update the `RecipeFormProps` interface to accept the optional `isOnboardingFlow` prop.
    - [ ] 3.3 In the `saveRecipe` function, modify the redirect logic. After `updateRecipe` is successful, check if `isOnboardingFlow` is true.
    - [ ] 3.4 If it is, redirect to `/recipes/preview/${recipeId}`.
    - [ ] 3.5 If it's false or undefined, keep the existing redirect logic: `router.push(`/recipes/${recipeId}...`)`.

- [x] 4.0 **Frontend: Implement Onboarding Redirect Flow**
    - [x] 4.1 In `src/app/first-recipe/page.tsx`, modify the `submitUrl`, `submitImage`, and `submitText` functions to add `?from=onboarding` to the redirect URL (e.g., `router.push(`/edit/${id}?from=onboarding`)`).
    - [x] 4.2 In `src/app/edit/[id]/page.tsx`, read the `from` search parameter.
    - [x] 4.3 Pass a new boolean prop, `isOnboardingFlow`, to the `<RecipeForm />` component if the `from` parameter equals `"onboarding"`.
    - [x] 4.4 In `src/components/recipe-form.tsx`, update the `RecipeFormProps` interface to accept the optional `isOnboardingFlow` prop.
    - [x] 4.5 In the `saveRecipe` function, check if `isOnboardingFlow` is true. If so, redirect to `/recipes/preview/${recipeId}`. Otherwise, use the existing redirect logic.

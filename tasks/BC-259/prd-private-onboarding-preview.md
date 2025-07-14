# PRD: Private Recipe Preview for Anonymous Onboarding

- **Ticket:** [BC-259](https://bonchef.atlassian.net/browse/BC-259)
- **Title:** Allow anonymous users to preview their first recipe via a dedicated page.

## 1. Problem Statement

When a new user creates their first recipe through the `/first-recipe` onboarding flow and chooses to make it "private", they are redirected to a "Recipe Not Found" page. This occurs because the recipe is owned by a generic "marketing user," and the anonymous user's session lacks the permissions to view private recipes owned by another user due to Row Level Security (RLS) policies.

## 2. Goal & Objective

The primary goal is to provide a seamless and consistent onboarding experience. New users must be able to immediately view the recipe they create, regardless of whether they set it to public or private. This should be achieved without altering the site-wide security model for private recipes.

## 3. User Stories / Functional Requirements

- **As a new anonymous user**, when I create my first recipe via the `/first-recipe` page (public or private), I want to be redirected to a dedicated preview page so I can see the result of my work.
- **As a platform administrator**, I want to ensure that this preview mechanism cannot be exploited to view other users' private recipes.

## 4. Proposed Solution / Technical Approach

We will create a new, dedicated preview page that has special permissions to show recipes created during the onboarding flow. This approach ensures the main recipe viewing page (`/recipes/[id]`) remains secure and unchanged, and simplifies the logic by removing the need for temporary tokens.

1.  **Create a New Preview Route:**
    - A new route will be created at `/recipes/preview/[id]`. This page will be exclusively used for showing recipes immediately after they are created in the `/first-recipe` flow.

2.  **Uniform Redirect Logic:**
    - The `recipe-form.tsx`, when used within the `/first-recipe` page, will always redirect to this new preview page (`/recipes/preview/[id]`) after saving the recipe, regardless of its public or private status.

3.  **Bypass RLS with Scoped Data Fetching:**
    - The `/recipes/preview/[id]` page will use a Supabase client with `service_role` privileges for its data fetching logic.
    - The server-side query will fetch a recipe by its `id` but **must** include a `WHERE` clause to verify that the `owner_id` of the recipe matches the ID of the generic "marketing user".
    - This query will ignore the `is_public` flag, allowing it to fetch the private recipe for the preview. The check against the marketing user's ID provides the necessary security boundary, ensuring this page cannot be used to view any other private recipe on the platform.

## 5. Scope

### In Scope:

- Creating the new page and layout files for the `/recipes/preview/[id]` route.
- Implementing a server action or data fetching function for the new route that uses a `service_role` client to fetch the recipe, scoped to the marketing user.
- Modifying the redirect logic in `recipe-form.tsx` or its related server actions to point to the `/recipes/preview/[id]` page when the form is submitted from the `/first-recipe` context.

### Out of Scope:

- Implementing any form of temporary tokens or a `preview_tokens` table.
- Making any changes to the existing `/recipes/[id]` page or its data fetching logic.
- Changing the global Row Level Security policies.

## 6. Success Metrics

- A new user going through the `/first-recipe` flow is successfully redirected to `/recipes/preview/[id]` after creating a recipe.
- The user can view the recipe on the preview page, whether it was saved as public or private.
- The new preview page cannot be used to view private recipes that are not owned by the marketing user.

## 7. Dependencies

- This work depends on the existing `/first-recipe` flow and the `recipe-form.tsx` component.
- It requires access to the "marketing user" ID in the backend to correctly scope the data-fetching query.

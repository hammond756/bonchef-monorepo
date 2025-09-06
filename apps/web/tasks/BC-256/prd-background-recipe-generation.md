# PRD: Background Recipe Generation

- **Ticket**: [BC-256](https://bonchef.atlassian.net/browse/BC-256)

## 1. Introduction & Overview

Currently, when a user imports a recipe via URL, image, or text, they must wait for the entire generation process to complete, which can take several seconds. This synchronous process blocks the user from interacting with the rest of the application.

This feature will move the recipe generation process to the background **for authenticated users**, allowing them to continue browsing, importing other recipes, or using the app freely immediately after submitting an import request. A placeholder card will be displayed in their collection ("Mijn recepten") to provide immediate feedback that the import has started. The existing synchronous flow will be preserved for anonymous users creating their first recipe.

## 2. Goals

- **Improve User Experience:** Eliminate wait times during recipe import for authenticated users.
- **Increase Engagement:** Allow users to perform other actions, like browsing or submitting another recipe, while an import is in progress.
- **Provide Clear Feedback:** Instantly show a placeholder in the user's collection to confirm that their request is being processed.

## 3. User Stories

- **As a user**, I want to submit a URL for a recipe import and be able to immediately navigate to other parts of the app.
- **As a user**, I want to see a temporary card in my collection for the recipe being generated, so I have confidence the process has started.
- **As a user**, I want the temporary card to show the input I provided (the URL, a preview of the image, or a snippet of the text).
- **As a user**, when the recipe generation is complete, I want the temporary card to automatically update to the full, interactive recipe card.
- **As a user**, if the recipe generation fails, I want the temporary card to disappear and receive a toast notification explaining the failure.

## 4. Functional Requirements

1.  **Asynchronous Submission (Authenticated Users):** When an authenticated user submits a recipe for import (from URL, image, or text) via the `/import` page, the request shall be processed in the background.
2.  **Synchronous Submission (Anonymous Onboarding):** The `/first-recipe` page used for anonymous user onboarding **must** retain its current synchronous (blocking) behavior. This is to ensure the `recipeId` is available immediately to be set in the `claimRecipeId` cookie for account association upon signup.
3.  **Recipe Card States:** The collection page will display recipe cards in one of three states:
    - **In-Progress:** A new import job that is currently being processed.
    - **Draft:** A recipe that has been successfully generated but has not yet been reviewed and published by the user.
    - **Published:** A recipe that is complete and visible to others (if public).
4.  **Immediate Feedback:** Upon submission, a new "In-Progress" card must immediately appear at the top of the user's "Mijn recepten" list.
5.  **In-Progress Card Content:** The in-progress card must display the source of the import (e.g., the URL, the uploaded image, or a snippet of the source text).
6.  **In-Progress Card UI:** The card will be visually distinct from regular recipe cards (e.g., "greyed out") and will be non-interactive (disabled).
7.  **Draft Card UI:** The "Draft" card will be interactive but should have a clear visual indicator (e.g., a "Draft" badge) prompting the user to review it. Clicking it should lead to the edit page.
8.  **Successful Generation:** Upon success, the "In-Progress" card will be seamlessly replaced by a "Draft" recipe card.
9.  **Failed Generation:** If generation fails, the "In-Progress" card will be removed from the collection page.
10. **Failure Notification:** Upon failure, a toast notification will be displayed to the user, informing them that the import failed.

## 5. Non-Goals (Out of Scope)

- A complex, persistent job queue system (like RabbitMQ, BullMQ, etc.). A "fire-and-forget" server-side process is acceptable for this iteration.
- A real-time progress indicator on the card (e.g., "50% complete"). The card will only have two states: "in-progress" and "completed" (or "failed").
- The ability for a user to cancel a generation job once it has started.

## 6. Design Considerations

- The in-progress card should use existing design system components, styled to appear "greyed out" or with a loading state to clearly differentiate it from other recipes.
- The failure notification should use the existing `useToast` hook for consistency.

## 7. Technical Considerations

- **Backend Process:** A "fire-and-forget" server action will be triggered on submission from the `/import` page. This action will handle the entire generation lifecycle. The original synchronous recipe generation functions will be maintained for the `/first-recipe` flow.
- **Data Model:** To avoid polluting the `recipes` table with incomplete data, a new table named `recipe_import_jobs` will be created to track the state of ongoing imports.
    - **Rationale:** This approach maintains a clean separation of concerns. The `recipes` table remains the source of truth for complete recipes, preserving its data integrity and non-nullable constraints. The `recipe_import_jobs` table handles the transient state of processing. The existing `status` column on the `recipes` table will be used to differentiate between `DRAFT` and `PUBLISHED` states for completed recipes.
    - **Proposed Schema for `recipe_import_jobs`:**
        - `id` (uuid, pk)
        - `user_id` (uuid, fk to `auth.users`)
        - `status` (enum: `pending`, `completed`, `failed`)
        - `source_type` (enum: `url`, `image`, `text`)
        - `source_data` (text, stores the URL, image URL, or raw text)
        - `recipe_id` (uuid, nullable fk to `recipes`, populated on completion)
        - `error_message` (text, nullable)
        - `created_at` (timestamp)
- **Frontend Logic:** The collection page ("Mijn recepten") will need to fetch and display data from both the `recipes` table and the `recipe_import_jobs` table, merging them into a single list for the user. The `/import` page will trigger the async job, while the `/first-recipe` page will continue to use the existing synchronous functions. It will need to poll or re-fetch data to check for status updates from the jobs table.

## 8. Success Metrics

- Increase in the number of recipes imported per user session.
- Reduction in the session drop-off rate on the import page.
- Positive qualitative feedback from users regarding the improved import experience.

## 9. Open Questions

- None at this time.

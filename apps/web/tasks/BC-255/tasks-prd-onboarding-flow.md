## Relevant Files

- `src/components/onboarding/onboarding-modal.tsx` - The main container component for the entire onboarding flow, managing state and transitions between screens.
- `src/components/onboarding/welcome-screen.tsx` - The first screen (Welcome) of the onboarding flow.
- `src/components/onboarding/introduction-screen.tsx` - The second screen (Introduction) of the onboarding flow.
- `src/components/onboarding/add-recipe-screen.tsx` - The third screen (Add Recipe) of the onboarding flow.
- `src/components/onboarding/success-screen.tsx` - The final screen (Success) of the onboarding flow.
- `src/hooks/use-onboarding.ts` - A new custom hook to manage the state, triggers, and visibility of the onboarding modal.
- `src/actions/onboarding.ts` - Server actions for the onboarding flow, including the background recipe import.
- `src/app/signup/actions.ts` - The existing signup server action, which will need to be modified to handle recipe transfer.
- `supabase/migrations/xxxx_add_onboarding_session_recipes.sql` - A new database migration file.
- `src/app/layout.tsx` - The root layout, where the `OnboardingModal` component will likely be rendered to be available globally.
- `src/components/layout/tab-bar.tsx` - The component containing the global '+' button, which needs to trigger the onboarding flow.
- `src/lib/posthog.ts` - The existing PostHog client file, which will be used to send the custom analytics events.
- `src/tests/onboarding.spec.ts` - A new E2E test file to verify the entire onboarding flow and its triggers.

### Notes

- This project primarily uses **Playwright** for end-to-end (E2E) testing. There is no separate component test runner like Jest configured.
- E2E tests verify the complete user flow in a browser. You can run them using `npm run test:e2e`.
- To test only the new onboarding feature, you can create a new test file like `src/tests/onboarding.spec.ts` and run it specifically.

## Tasks

- [x] **1.0 Create the Onboarding UI Shell and Screens**
    - [x] 1.1 Create the main `OnboardingModal` component (`src/components/onboarding/onboarding-modal.tsx`).
    - [x] 1.2 Implement the overlay shell using `Dialog` from shadcn/ui, styled to slide up from the bottom and include the header with title, back, and close buttons.
    - [x] 1.3 Create the static `WelcomeScreen` component (`src/components/onboarding/welcome-screen.tsx`).
    - [x] 1.4 Create the static `IntroductionScreen` component (`src/components/onboarding/introduction-screen.tsx`).
    - [x] 1.5 Create the `AddRecipeScreen` component (`src/components/onboarding/add-recipe-screen.tsx`) and integrate the new import components (`PhotoImportView`, `URLImportPopup`, `TextImportPopup`).
    - [x] 1.6 Create the static `SuccessScreen` component (`src/components/onboarding/success-screen.tsx`).
    - [x] 1.7 Use a simple `useState` in `OnboardingModal` to manage and render the currently active screen.

- [x] **2.0 Implement State Management and Intra-Onboarding Navigation**
    - [x] 2.1 Create the `useOnboarding` hook (`src/hooks/use-onboarding.ts`). It should manage the `currentStep` and the `isOpen` state.
    - [x] 2.2 Refactor `OnboardingModal` to use the `useOnboarding` hook to control which screen is shown.
    - [x] 2.3 Add functions to the hook like `nextStep`, `prevStep`, `openModal`, `closeModal` to manage the flow.
    - [x] 2.4 Wire the CTAs in each screen to call the appropriate functions from the hook (e.g., "Laat me zien" calls `nextStep`).
    - [x] 2.5 Connect the recipe import components (`PhotoImportView`, `URLImportPopup`, `TextImportPopup`) to their existing flows. On successful job creation, call a function from the hook that transitions to the Success screen.
    - [x] 2.6 Implement the "Bekijk en controleer je recept" button on the Success screen to navigate the user to `/signup`.

- [x] **3.0 Implement Backend for Anonymous Recipe Onboarding**
    - [x] 3.1 Create a new Supabase migration to add a unified `onboarding_associations` table. It should contain `onboarding_session_id` (uuid), `recipe_id` (uuid, nullable), and `job_id` (uuid, nullable) columns.
    - [x] 3.2 Implement client-side logic (e.g., in a new `useOnboardingSession` hook or directly in `useOnboarding`) to generate a V4 UUID for the `onboarding_session_id`, store it in a long-lived cookie, and retrieve it when needed.
    - [x] 3.3 Update the server actions for photo, URL, and text import to accept the `onboarding_session_id` as a parameter. When a job is created, insert a record into `onboarding_associations` linking the `job_id` to the session ID.
    - [x] 3.4 After a `recipe_import_jobs` job succeeds and the `createDraftRecipe` function runs, create a new record in `onboarding_associations` linking the new `recipe_id` to the same session ID.
    - [x] 3.5 Modify the signup server action in `src/app/signup/actions.ts` to handle the new association model:
        - Check for the `onboarding_session_id` cookie.
        - If it exists, find all associated `recipe_id`s and `job_id`s from the `onboarding_associations` table.
        - Update the `user_id` on all corresponding records in the `recipes` and `recipe_import_jobs` tables.
        - Delete the records from `onboarding_associations` and clear the cookie.

- [ ] **4.0 Implement Onboarding Triggers and Analytics**
    - [x] 4.1 Place the `OnboardingModal` in the global `layout.tsx` so it can be triggered from anywhere.
    - [x] 4.2 Add logic to the `useOnboarding` hook to handle the triggers:
        - Clicking the '+' button in `tab-bar.tsx` should call `openModal`.
        - A timer-based trigger (2 minutes).
        - A trigger for the first visit to the `/collection` page.
        - A trigger for back-button navigation from a recipe page.
    - [x] 4.3 Ensure the trigger logic only runs for unauthenticated users.
    - [x] 4.4 Integrate PostHog analytics into the `useOnboarding` hook.
    - [x] 4.5 In the `nextStep` function, fire the `onboarding_step_completed` event with the correct `step_index` and `total_steps`.

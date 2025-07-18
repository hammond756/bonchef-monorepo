## Relevant Files

-   `src/components/import/import-overlay.tsx` (New) - Main client component for the new import overlay that slides up.
-   `src/components/import/photo-import-view.tsx` (New) - Full-screen client component for the camera and gallery interface.
-   `src/components/import/url-import-popup.tsx` (New) - Client component for the URL import popup.
-   `src/components/import/text-import-popup.tsx` (New) - Client component for the text/note import popup.
-   `src/components/layout/tab-bar.tsx` (Modification) - To change the '+' button's `onClick` handler and to display the notification badge.
-   `src/lib/store/import-status-store.ts` (New) - Zustand store to globally manage the count of recipes pending review for the notification badge.
-   `src/app/api/import/start/route.ts` (New) - API endpoint to handle the asynchronous start of an import, creating a recipe record with a 'processing' status.
-   `src/app/collection/page.tsx` (Modification) - To fetch and display recipes with the new statuses (`processing`, `ready_for_review`, `error`).
-   `src/components/recipe/recipe-card.tsx` (Modification) - To implement the different visual states for a recipe tile (processing, ready for review, error).
-   `src/lib/types.ts` (Modification) - To add/update the `status` enum/type for a recipe.
-   `supabase/migrations/YYYYMMDDHHMMSS_add_recipe_statuses.sql` (New) - SQL migration to add the `status` column to the `recipes` table (e.g., with values `processing`, `ready_for_review`, `error`, `published`, `private`).
-   `tests/e2e/new-recipe-import.spec.ts` (New) - Playwright E2E test file for the entire new import flow.

### Notes

-   Unit tests should be created alongside the components they test (e.g., `import-overlay.test.tsx`).
-   Use `npx jest [optional/path/to/test/file]` to run unit tests.
-   Use `npx playwright test` to run E2E tests.

## Tasks

- [x] 1.0 **Foundation: Build the New Import Overlay & Entry Point**
  - [x] 1.1 Modify the `tab-bar.tsx` component: change the '+' button from a link to a button that toggles the state for the new import overlay.
  - [x] 1.2 Create the `import-overlay.tsx` component as a client component.
  - [x] 1.3 Style the overlay to slide up from the bottom, covering part of the screen, with the required rounded corners and styling.
  - [x] 1.4 Add the 'Photo', 'Website', and 'Text' buttons. Style the 'Chat' button to appear disabled or indicate it is out of scope.
  - [x] 1.5 Deprecate and remove the old `/import` page route and related components.

- [x] 2.0 **Core Functionality: Implement Individual Import Flows (Photo, URL, Text)**
  - [ ] 2.1 **Photo Flow:** Create the `photo-import-view.tsx` component that opens full-screen.
  - [ ] 2.2 In the photo view, integrate with device camera/gallery APIs.
  - [ ] 2.3 Implement the semi-transparent thumbnail strip to show previews of taken photos.
  - [ ] 2.4 Add the 'bonchef!' button to finalize photo selection and trigger the import.
  - [x] 2.5 **URL/Text Flow:** Create the `url-import-popup.tsx` and `text-import-popup.tsx` components.
  - [x] 2.6 Implement the logic where selecting 'Website' or 'Text' from the main overlay hides it and shows the corresponding popup.
  - [x] 2.7 Add the 'bonchef!' button to each popup to trigger the import.

- [x] 3.0 **User Feedback: Implement Asynchronous Import Kick-off and UI Feedback**
  - [x] 3.1 Create the new API endpoint at `api/import/start/route.ts`. This endpoint will receive the import data (URL, text, or image references).
  - [x] 3.2 The API should create a new record in the `recipes` table with a `status` of `processing` and return a success response immediately.
  - [x] 3.3 On the client, after successfully calling the API, trigger the animation of the popup/sheet towards the collection icon.
  - [x] 3.4 Create the `import-status-store.ts` (Zustand) to hold the count of pending recipes.
  - [x] 3.5 After the API call, increment the count in the store. The `tab-bar.tsx` component should read from this store to display the notification badge.

- [x] 4.0 **Integration: Update Collection Page for New Recipe States**
  - [x] 4.1 In `collection/page.tsx`, update the data fetching logic to include recipes with `processing`, `ready_for_review`, and `error` statuses.
  - [x] 4.2 Modify the `recipe-card.tsx` component to render different visual states for a recipe tile (processing, ready for review, error).
  - [x] 4.3 Implement the 'processing' state view for the recipe card, including the progress pie chart icon and ensuring the title is visible ASAP.
  - [x] 4.4 Implement the 'ready for review' state view, with a clear label/badge on the tile. Ensure it's clickable.

- [x] 5.0 **Finalization: Connect to Review Flow and Implement Error Handling**
  - [x] 5.1 Ensure that clicking a 'ready for review' card navigates the user to the correct `/edit/[id]` page.
  - [x] 5.2 After a recipe is saved from the edit page, ensure its status is updated (e.g., to `published`) and the count in the `import-status-store` is decremented.
  - [x] 5.3 Implement the immediate client-side check for 'forbidden' URLs. If forbidden, show a toast notification and do not proceed with the import.
  - [x] 5.4 Implement the 'error' state view for the recipe card, showing an error icon.
  - [x] 5.5 Create a modal that appears when an error card is clicked, displaying the specific error message (e.g., "Sorry, we could not retrieve the recipe from [URL]").
  - [x] 5.6 The modal should have an 'OK' button that, when clicked, calls an API to delete the errored recipe record and removes the tile from the UI.
  - [ ] 5.7 Write an E2E test in `new-recipe-import.spec.ts` covering a successful import and review, and a failed import. 
## Relevant Files

- `src/app/edit/[id]/actions.ts` - The `saveRecipe` server action needs to be modified to append `?from=edit` to the redirect URL.
- `src/components/ui/back-button.tsx` - This component will be simplified to use the `useSearchParams` hook and check for the `from=edit` query parameter.
- `src/tests/e2e/back-button-flow.spec.ts` - The e2e test needs to be updated to validate the new query parameter logic.

### Notes

- Use `npx playwright test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Playwright configuration.

## Tasks

- [x] **1.0 Clean up previous implementation**
    - [x] 1.1 Delete the file `src/lib/store/navigation-store.ts`.
    - [x] 1.2 Delete the file `src/components/util/navigation-tracker.tsx`.
- [ ] **1.0 Clean up previous implementation**
    - [ ] 1.1 Delete the file `src/lib/store/navigation-store.ts`.
    - [ ] 1.2 Delete the file `src/components/util/navigation-tracker.tsx`.
    - [ ] 1.3 Remove the `<NavigationTracker>` import and usage from `src/app/ontdek/page.tsx`.
    - [ ] 1.4 Remove the `<NavigationTracker>` import and usage from `src/app/collection/page.tsx`.

- [x] **2.0 Update Server Action to pass query parameter**
    - [x] 2.1 In `src/app/edit/[id]/actions.ts`, locate the `saveRecipe` function.
    - [x] 2.2 Modify the `redirect()` call to append `?from=edit` to the URL (e.g., `/recipes/[id]?from=edit`).

- [x] **3.0 Update Back Button logic**
    - [x] 3.1 In `src/components/ui/back-button.tsx`, remove the imports and usage of the old Zustand store.
    - [x] 3.2 Add the `useSearchParams` hook from `next/navigation` to read the URL query parameters.
    - [x] 3.3 In the `handleBack` function, implement the new logic: if `searchParams.get('from') === 'edit'`, navigate to `/ontdek`.
    - [x] 3.4 Otherwise, fall back to the standard `router.back()` behavior.

- [x] **4.0 Update End-to-End Tests**
    - [x] 4.1 In `src/tests/e2e/back-button-flow.spec.ts`, update the tests for the "ontdek" and "collection" flows.
    - [x] 4.2 The test should now assert that after saving, the URL is `/recipes/[id]?from=edit`.
    - [x] 4.3 The test should then assert that clicking the back button navigates the user to `/ontdek`.
    - [x] 4.4 The modal test (`back button is not visible when a modal is open`) can remain as is, but ensure it still passes.

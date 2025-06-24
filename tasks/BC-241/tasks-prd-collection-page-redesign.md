## Relevant Files

- `src/app/collection/page.tsx` - The main component for the collection page where most changes will be implemented.
- `src/app/collection/layout.tsx` - Ensures the page uses the correct base layout (`TabLayout`).
- `src/components/recipe/recipe-card.tsx` - The standard recipe card component that will be used for the grid view.
- `src/components/ui/app-tabs.tsx` - The component used to render the navigation tabs ("Mijn recepten", "Mijn favorieten").
- `src/app/collection/_components/compact-recipe-card.tsx` - **New file:** A new component will be created for the compact list view.
- `tests/collection.spec.ts` - **New file:** A new Playwright test file to verify the new functionality.

### Notes

- Unit tests and component files should be co-located where possible.
- Use `npx playwright test tests/collection.spec.ts` to run the specific tests for this feature.

## Tasks

- [x] 1.0 Add Sticky Navigation Tabs to Collection Page

    - [x] 1.1 In `src/app/collection/page.tsx`, wrap the existing `Tabs` component in a `div`.
    - [x] 1.2 Apply Tailwind CSS classes to this `div` to make it sticky (e.g., `sticky top-0 z-10`) and give it a background color (e.g., `bg-surface`) to prevent content from showing through during scroll.
    - [x] 1.3 Verify that the tabs remain fixed at the top of the content area while the recipe list scrolls underneath.

- [ ] 2.0 Implement Grid View with `RecipeCard`

    - [ ] 2.1 In `src/app/collection/page.tsx`, find the `TabsContent` for the grid view.
    - [ ] 2.2 Replace the current implementation inside with a map over the `ownRecipes` and `likedRecipes` state variables.
    - [ ] 2.3 For each recipe, render the `<RecipeCard recipe={recipe} />` component.
    - [ ] 2.4 Ensure the container for the cards has the correct grid styling (e.g., `grid grid-cols-2 gap-4`).
    - [ ] 2.5 Confirm the `LikeButton` within each `RecipeCard` is interactive and functions correctly.

- [ ] 3.0 Implement Compact List View

    - [ ] 3.1 Create a new file for a new component: `src/app/collection/_components/compact-recipe-card.tsx`.
    - [ ] 3.2 The `CompactRecipeCard` component should accept a `recipe` object as a prop.
    - [ ] 3.3 The component layout should be a `Link` tag wrapping a `div` with a horizontal flex layout, containing a small thumbnail image, the recipe title, and the `LikeButton`.
    - [ ] 3.4 In `src/app/collection/page.tsx`, update the list view's `TabsContent` to map over the recipes and render the new `CompactRecipeCard` for each one.

- [ ] 4.0 Finalize and Test
    - [ ] 4.1 Create the new test file `tests/collection.spec.ts`.
    - [ ] 4.2 Write a test to ensure the navigation tabs stick to the top when the user scrolls down.
    - [ ] 4.3 Write a test to confirm that clicking a recipe in both grid and list view navigates to the correct URL.
    - [ ] 4.4 Write a test to verify the `LikeButton` is present and clickable in both views.
    - [ ] 4.5 Manually test the page for responsiveness on various screen sizes.

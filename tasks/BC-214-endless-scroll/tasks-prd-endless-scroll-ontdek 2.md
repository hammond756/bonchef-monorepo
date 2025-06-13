## Relevant Files

- `src/services/recipes/index.ts` - We need to add a new server action here to fetch recipes with pagination.
- `src/components/public-recipe-timeline.tsx` - This component will be refactored to a client component to handle state and the infinite scroll logic.
- `src/app/ontdek/page.tsx` - The main page, which will continue to use Suspense for the initial load.
- `src/components/ui/loading-indicator.tsx` - A new UI component to show when more recipes are being loaded.
- `e2e/discovery-page-scroll.spec.ts` - A new E2E test file to ensure the endless scroll functionality works as expected.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npx playwright test` to run the end-to-end tests.

## Tasks

- [ ] 1.0 Create a server action to fetch paginated public recipes
    - [ ] 1.1 Define a new function in `src/services/recipes/index.ts` that accepts `page` and `limit` parameters for pagination.
    - [ ] 1.2 Implement the Supabase query using `.range()` to fetch the correct slice of public recipes.
    - [ ] 1.3 The function should return the fetched recipes and a boolean indicating if more recipes are available.
    - [ ] 1.4 Create a dedicated server action file (e.g., `app/actions.ts`) to securely call this service function from the client.
- [ ] 2.0 Refactor `PublicRecipeTimeline` to manage state for recipes, pagination, and loading
    - [ ] 2.1 Convert `PublicRecipeTimeline` to a client component using the `"use client";` directive.
    - [ ] 2.2 Initialize state for `recipes`, `page`, `isLoading`, and `hasMore` using `useState`.
    - [ ] 2.3 Fetch the initial batch of recipes using a `useEffect` hook when the component mounts.
    - [ ] 2.4 Create a `loadMoreRecipes` function that calls the server action, appends new recipes to the state, and updates the `isLoading` and `hasMore` flags.
- [ ] 3.0 Implement the infinite scroll trigger mechanism
    - [ ] 3.1 Use a hook like `useInView` (from `react-intersection-observer`) to monitor a trigger element.
    - [ ] 3.2 Place a `div` element at the bottom of the recipe list to act as the trigger.
    - [ ] 3.3 When this trigger element enters the viewport, and if `isLoading` is false and `hasMore` is true, call the `loadMoreRecipes` function.
- [ ] 4.0 Develop the UI components for loading, end-of-list, and error states
    - [ ] 4.1 Create a `LoadingIndicator` component (`src/components/ui/loading-indicator.tsx`) that displays a spinner or similar animation.
    - [ ] 4.2 Conditionally render the `LoadingIndicator` at the bottom of the list when `isLoading` is true.
    - [ ] 4.3 When `hasMore` is false and the list is not empty, display a "You've seen all recipes!" message.
    - [ ] 4.4 Implement UI to display a network error message if the fetch call fails.
- [ ] 5.0 Integrate and test the complete end-to-end endless scroll flow
    - [ ] 5.1 Ensure the initial data is passed from the server and hydrated correctly on the client.
    - [ ] 5.2 Manually test the happy path: scrolling down should load new recipes and show the loading indicator.
    - [ ] 5.3 Manually test the edge cases: reaching the end of the list and handling network errors.
    - [ ] 5.4 Create a new Playwright test file (`e2e/discovery-page-scroll.spec.ts`) that scrolls the discovery page and asserts that new recipe items are loaded into the DOM.

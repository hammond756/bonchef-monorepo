## Relevant Files

- `src/app/ontdek/page.tsx` - The main discovery page where the infinite scroll component will be integrated.
- `src/components/public-recipe-timeline.tsx` - The existing component that will be updated or replaced with the infinite scroll logic.
- `src/components/public-recipe-timeline.test.tsx` - Tests for the recipe timeline component should be updated.
- `src/hooks/use-public-recipes.ts` - This hook will be modified to handle paginated fetching, state management for recipes, loading, and errors.
- `src/hooks/use-public-recipes.test.ts` - Unit tests for the `use-public-recipes` hook.
- `src/lib/services/recipe-service.ts` - The service responsible for fetching data; may need updates to support pagination.
- `src/app/api/public/recipes/route.ts` - The API endpoint that provides the recipes, which will need to handle pagination parameters.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Update the Recipe Service and API for Pagination
    - [ ] 1.1 Modify the `getPublicRecipes` function in `src/lib/services/recipe-service.ts` to accept pagination parameters like `page` and `limit`.
    - [ ] 1.2 Update the API route in `src/app/api/public/recipes/route.ts` to read the `page` and `limit` query parameters and pass them to the database query.
- [ ] 2.0 Enhance the `use-public-recipes` Hook
    - [ ] 2.1 In `src/hooks/use-public-recipes.ts`, add state to manage the current page, the list of recipes, loading status, and potential errors.
    - [ ] 2.2 Create a `loadMore` function within the hook that increments the page number and fetches the next set of recipes.
    - [ ] 2.3 Ensure that new recipes are appended to the existing list, not replacing it.
- [ ] 3.0 Implement the Infinite Scroll UI in `public-recipe-timeline.tsx`
    - [ ] 3.1 Use a library like `react-intersection-observer` or a custom hook to detect when the user has scrolled to the last item in the list.
    - [ ] 3.2 When the last item is visible, call the `loadMore` function from the `use-public-recipes` hook.
    - [ ] 3.3 Add a skeleton or spinner component at the bottom of the list that is visible only when the `loading` state is true.
- [ ] 4.0 Handle Edge Cases and Final Integration
    - [ ] 4.1 Display a message like "You've seen all recipes!" when the API returns an empty array, indicating no more recipes are available.
    - [ ] 4.2 If the fetch fails, display a user-friendly error message.
    - [ ] 4.3 Replace the static timeline in `src/app/ontdek/page.tsx` with the newly updated `PublicRecipeTimeline` component.
    - [ ] 4.4 Update all relevant tests to account for the new asynchronous loading and state changes.

## Relevant Files

- `src/app/ontdek/page.tsx` - The main page that will host the new feed layout and search bar.
- `src/components/public-recipe-timeline.tsx` - This component will be heavily modified or rewritten to render a vertical feed of the new recipe cards instead of a grid.
- `src/components/recipe/recipe-feed-card.tsx` - **(New File)** A new component to be created for the full-screen recipe card, containing all the new design elements.
- `src/components/recipe/recipe-feed-card.test.tsx` - **(New File)** Tests for the new `RecipeFeedCard` component.
- `src/components/ui/search-bar.tsx` - **(New File)** A new component for the search bar UI.
- `src/hooks/use-public-recipes.ts` - The hook will be updated to support search/filtering functionality.
- `src/app/api/public/recipes/route.ts` - The API endpoint will be updated to handle search queries from the frontend.

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 **Rebuild the Core Recipe Card Component**
  - [ ] 1.1 Create a new file `src/components/recipe/recipe-feed-card.tsx`.
  - [ ] 1.2 Build the main card container with rounded corners and appropriate margins to ensure spacing in the feed.
  - [ ] 1.3 Use Tailwind CSS to enforce a 3:4 aspect ratio for the card's image container.
- [ ] 2.0 **Implement Card Content and Media Display**
  - [ ] 2.1 Integrate Next.js's `Image` component within the card, using `object-cover` and `fill` to handle the center-cropping for the 3:4 aspect ratio.
  - [ ] 2.2 Overlay the recipe's `description` (as a caption), title, and author name over the image.
  - [ ] 2.3 Implement the "show more" functionality for the caption using component state (`useState`). The caption should truncate after two sentences.
  - [ ] 2.4 Add a conditional dark overlay (`bg-black/25`) that appears when the caption is expanded to ensure text readability.
- [ ] 3.0 **Add Interactive Elements to the Card**
  - [ ] 3.1 Integrate the existing `LikeButton` component onto the card.
  - [ ] 3.2 Add a new "Share" button. It can use the Web Share API or copy the recipe link to the clipboard.
  - [ ] 3.3 Add the author's `ProfileImage` component, making sure it links to their profile page.
  - [ ] 3.4 Style and position these interactive elements vertically on the right side of the card, as per the mockup.
- [ ] 4.0 **Integrate New Components into the Discovery Page Layout**
  - [ ] 4.1 Refactor `src/components/public-recipe-timeline.tsx` to render a single-column vertical list of the new `RecipeFeedCard` components.
  - [ ] 4.2 Ensure the existing infinite scroll logic continues to work correctly with the new vertical layout.
  - [ ] 4.3 Add a new `SearchBar` component to `src/app/ontdek/page.tsx`.
- [ ] 5.0 **Implement Search Functionality**
  - [ ] 5.1 In `src/hooks/use-public-recipes.ts`, add a parameter for a search query.
  - [ ] 5.2 Modify the `getKey` function in the hook to include the search query in the API request URL if it exists.
  - [ ] 5.3 Update the API route at `src/app/api/public/recipes/route.ts` to read the search query parameter.
  - [ ] 5.4 In the API route, modify the Supabase query to filter recipes based on the search term (e.g., searching in title, description, or ingredients).
- [ ] 6.0 **Testing and Final Review**
  - [ ] 6.1 Write unit tests for the new `RecipeFeedCard` component, covering interactions like expanding the caption.
  - [ ] 6.2 Update existing tests for `PublicRecipeTimeline` and `use-public-recipes` to reflect the new UI and search functionality.
  - [ ] 6.3 Manually perform end-to-end testing on the entire Discovery page flow to ensure all requirements from the PRD are met. 
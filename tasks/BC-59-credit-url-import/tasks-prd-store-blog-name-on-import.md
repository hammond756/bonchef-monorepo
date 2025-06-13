## Relevant Files

- `src/actions/recipe-imports.ts` - Contains the primary logic for scraping and importing recipes. This is where the LLM call is made.
- `src/lib/utils.ts` - A file for common utility functions. We will add a helper here to extract the hostname from a URL.
- `src/app/recipes/[id]/page.tsx` - The main component for displaying the recipe detail view. This is where the source name will be rendered.
- `src/tests/recipe-import.spec.ts` - A new end-to-end test file to verify the import functionality, including the new source name display.

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx playwright test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Playwright configuration.

## Tasks

- [x] 1.0 Update Recipe Scraping Service
  - [x] 1.1 Modify the `formatRecipe` function in `src/actions/recipe-imports.ts` to include `source_name` in the data extracted by the LLM.
  - [x] 1.2 Update the `scrapeRecipe` function to handle the new `source_name` field from `formatRecipe`.
  - [x] 1.3 Make sure the `source_url` is taken from the value passed to `scrapeRecipe`
- [x] 2.0 Implement Fallback Logic
  - [x] 2.1 Create a new utility function `getHostnameFromUrl(url: string): string` in `src/lib/utils.ts`.
  - [x] 2.2 In `scrapeRecipe`, use this utility as a fallback to populate `source_name` if it's not returned by the LLM.
- [x] 3.0 Update Recipe Detail UI
  - [x] 3.1 In `src/app/recipes/[id]/page.tsx`, access the `source_name` and `source_url` from the recipe data.
  - [x] 3.2 Render the `source_name` as a hyperlink (`<a>` tag) that points to the `source_url`.
  - [x] 3.3 Ensure the link opens in a new tab using `target="_blank"`.
  - [x] 3.4 Add conditional logic to only render the source link if `source_name` is not "BonChef" and `source_url` is not "https://app.bonchef.io".
- [x] 4.0 End-to-End Testing
  - [x] 4.1 Create a new test file at `src/tests/recipe-import.spec.ts`.
  - [x] 4.2 Write a test that imports a recipe from a known URL.
  - [x] 4.3 Navigate to the imported recipe's detail page.
  - [x] 4.4 Add an assertion to verify that the blog's name is displayed correctly and links to the correct source URL. 
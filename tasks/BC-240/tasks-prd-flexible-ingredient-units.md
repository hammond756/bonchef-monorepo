## Relevant Files

- `src/services/recipe-service.ts` - Business logic for managing recipes and their ingredients within the JSON blob.
- `src/lib/types.ts` - Contains the TypeScript interfaces for recipes and ingredients.
- `src/app/import/page.tsx` - The page handling the recipe import flow.
- `src/app/edit/[id]/page.tsx` - The page for editing an existing recipe.
- `src/components/ingredient-form.tsx` - A potential component used for adding/editing ingredients.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npm test` or `npx jest [optional/path/to/test/file]` to run tests.

## Tasks

- [ ] 1.0 Refactor Backend Services and Data Models for JSON Ingredients

    - [ ] 1.1 Locate the TypeScript interface for an `Ingredient` (likely in a types definition file). Update the `unit` property from an `enum` to `string`.
    - [ ] 1.2 Remove the `UnitEnum` definition from the codebase.
    - [ ] 1.3 In the service layer (`recipe-service.ts`), create a helper function to gracefully handle old and new unit formats for display purposes. This function should check if a unit is one of the old enum keys (e.g., 'GRAMS') and convert it to its string representation (e.g., 'grams'). For all other values, it should return the value as is.
    - [ ] 1.4 Update all data retrieval functions in the service layer to apply this helper function to the `unit` field of each ingredient before returning the data to the frontend. New recipes will be saved with string units directly.
    - [ ] 1.5 Update or write unit tests for the service layer to verify that both old and new ingredient formats are handled correctly.

- [ ] 2.0 Update Recipe Import and Translation Logic

    - [ ] 2.1 Modify the recipe parsing logic to extract the raw unit string for each ingredient.
    - [ ] 2.2 Create a utility module or a constant map for unit translations (e.g., `{ tbsp: 'eetlepel' }`).
    - [ ] 2.3 Integrate this translation utility into the import process, applying it only when a recipe is being translated to Dutch.
    - [ ] 2.4 Ensure the import service saves the final unit string into the ingredients JSON blob.

- [ ] 3.0 Update Recipe Creation/Editing UI

    - [ ] 3.1 Locate the form component(s) for editing ingredients (used on `/edit/[id]` page).
    - [ ] 3.2 Replace the `<select>` dropdown for units with an `<input type="text">`.
    - [ ] 3.3 Ensure the input correctly binds to the `unit` property of the ingredient object within the form's state.
    - [ ] 3.4 Verify that saving the form updates the ingredients JSON blob correctly with the new custom unit string.

- [ ] 4.0 End-to-End Testing and Validation
    - [ ] 4.1 Write a Playwright test for importing a recipe with non-standard units (e.g., 'leaves') and verify it is displayed correctly.
    - [ ] 4.2 Write a Playwright test for editing a recipe to use a custom unit and verify the change is saved and displayed correctly.
    - [ ] 4.3 Manually test with an _existing_ recipe to ensure the old unit format is displayed correctly (e.g., a unit stored as 'GRAMS' shows as 'grams' in the UI).
    - [ ] 4.4 Manually test the full create, import, edit, and view flow to catch any regressions.

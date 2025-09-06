# PRD: Flexibele Ingredient Units

### 0. Online Resources

- **Jira Ticket:** [BC-240](https://bonchef.atlassian.net/browse/BC-240)

### 1. Introduction/Overview

As a user, I want the imports of my recipes to be as true to the original as possible. This means preserving every possible unit in my ingredient list. Currently, when a user imports a recipe from a source like a cookbook scan or a website, our system attempts to map the ingredient units to a predefined list (an `Enum`). This causes units that are not on the list (e.g., 'drops', 'shot glass', 'leaves') to be lost or incorrectly converted. This feature aims to remove this limitation to ensure imported recipes are an exact reflection of their source, maintaining authenticity and accuracy.

### 2. Goals

- Allow any string to be used as an ingredient unit, removing the restriction of a predefined list.
- Preserve the original unit text from imported or manually created recipes.
- Ensure the user experience for viewing recipes remains consistent.
- Update the database schema and application logic to support flexible, string-based units.

### 3. User Stories

- **As a user**, when I import a recipe, I want all ingredient units (like 'drops', 'shot glass', 'leaves') to be saved exactly as they appear in the source, so the recipe remains authentic and easy to follow.
- **As a user**, I want to be able to manually enter any unit I want when creating or editing a recipe, so I am not limited by a predefined list of options.

### 4. Functional Requirements

1. The system must accept and store any string value for an ingredient's unit.
2. The `unit` field in the relevant database table must be changed from an `Enum` type to a `string` or `text` type.
3. The recipe import logic must be updated to extract and save the unit text exactly as it appears in the source material, without mapping it to a preset list.
4. When a recipe is displayed in the UI, the saved unit string must be shown alongside the ingredient quantity, just as it is now.
5. The UI for adding or editing ingredients must be changed from a dropdown/select list for units to a free-text input field.
6. For recipes that are automatically translated from another language to Dutch, a translation mapping should be applied to common units (e.g., 'tbsp' -> 'eetlepel', 'tsp' -> 'theelepel'). This mapping should only be used for translation and not for validation or restriction. The original formatting from the source should be respected.

### 5. Non-Goals (Out of Scope)

- This feature will **not** introduce unit conversion logic (e.g., converting '1 cup' to '240ml'). The system will only store and display the unit as text.
- The logic for handling numeric ranges in quantities (e.g., "2-3") will **not** be changed.
- No automatic validation or correction will be performed on the unit string, other than the specific translation cases mentioned in the requirements.

### 6. Design Considerations

- The UI for **displaying** ingredients does not need to change.
- The UI for **editing/creating** an ingredient needs to replace the unit dropdown with a text input field, allowing for free-form entry.

### 7. Technical Considerations

- A **database migration** is required to alter the `ingredients` table. The `unit` column's data type must be changed from an enum to a text-based type.
- Existing data must be migrated. The current enum values (e.g., `UnitEnum.GRAMS`) should be converted to their string representations (e.g., 'grams').
- The service layer, data models, and any other application code that references the unit enum must be refactored to handle string-based units.
- The translation mapping for units (e.g., English to Dutch) should be maintained in a clear and easily updatable location, such as a constants file or a simple utility module.

### 8. Success Metrics

- 100% of newly imported recipes retain their original, non-standard units.
- A measurable decrease in user feedback or support requests related to incorrect or missing units in recipes.
- User testing confirms that creating and editing recipes with custom units is intuitive and effective.

### 9. Open Questions

- Where should the translation mapping for units be defined and maintained? A suggested approach is a simple object in a constants file, but this should be confirmed during implementation.

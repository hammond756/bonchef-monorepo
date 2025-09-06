# PRD: Recipe Import Verification & Editing

- **Feature:** Recipe Import Review Flow
- **Ticket:** [BC-196](https://bonchef.atlassian.net/browse/BC-196)

## 1. Introduction & Overview

Currently, recipes imported via URL, text, or image are saved to a user's cookbook immediately. This process lacks a crucial verification step, preventing users from correcting parsing errors or making personal adjustments before the recipe is permanently saved.

This feature introduces a mandatory review and editing screen that appears immediately after a recipe is imported. This gives users full control to verify, edit, and consciously save the recipe, ensuring higher quality and accuracy in their personal cookbook.

## 2. Goals

- **User Control:** Empower users to review and edit all parsed recipe data before saving it.
- **Data Quality:** Improve the accuracy and completeness of user-saved recipes by correcting import errors.
- **Consistent Experience:** Create a unified editing interface that is used for both newly imported recipes and existing recipes.
- **Increase Satisfaction:** Enhance the user experience by making the import process more transparent and flexible.

## 3. User Stories

- **As a user,** I want to review the recipe details extracted from a URL before saving it, so that I can correct any parsing errors.
- **As a user,** I want to edit the ingredients and instructions of a recipe I imported from text, so I can adjust it to my liking before it's added to my collection.
- **As a user,** I want to change the auto-generated photo of an imported recipe, so I can replace it with my own or a better AI-generated one.
- **As a user,** I want to discard an imported recipe if it's not what I expected, so my cookbook doesn't get cluttered.
- **As a user,** I want to add, remove, and reorder ingredients or instructions to perfectly match my version of the recipe.

## 4. Functional Requirements

| ID    | Requirement                                                                                                                                                                                               |
| :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | After a user imports a recipe (from URL, text, or image), the system **must** redirect them to the `/edit` page with the parsed recipe data pre-filled in the form fields.                                |
| FR-2  | The `/edit` page **must** allow editing of all recipe fields: title, description, image, prep time, cook time, servings, ingredients, and instructions.                                                   |
| FR-3  | Users **must** be able to reorder, add, and delete items in the ingredient list.                                                                                                                          |
| FR-4  | Users **must** be able to reorder, add, and delete items in the instructions list.                                                                                                                        |
| FR-5  | For the recipe image, the user **must** have the option to either upload a new image or generate a new one using AI.                                                                                      |
| FR-6  | The page **must** have a primary "Opslaan" (Save) button. Clicking it saves the recipe to the user's cookbook and redirects them to the view page for the newly created recipe.                           |
| FR-7  | The page **must** have a secondary "Annuleren" (Cancel) button.                                                                                                                                           |
| FR-8  | If a user clicks "Annuleren" without making any edits, the system **must** navigate them to the previous page in their browser history.                                                                   |
| FR-9  | If a user clicks "Annuleren" _after_ making edits, the system **must** show a confirmation dialog. If the user confirms, the system **must** navigate them to the previous page in their browser history. |
| FR-10 | If a user with unsaved changes attempts to navigate away from the page (e.g., using the browser's back button or closing the tab), a browser-native warning **must** be displayed to prevent data loss.   |

## 5. Non-Goals (Out of Scope)

- Auto-saving or draft functionality. Saving is an explicit user action.
- Real-time collaboration or sharing of the edit session.
- Changes to the underlying data parsing/import logic. This feature only addresses the post-import workflow.

## 6. Design & UI Considerations

- The editing interface **must** reuse the existing components and layout from the current `/edit` page to ensure a consistent user experience.
- The design **must** be responsive and mobile-first, adhering to the application's established style guide.
- All interactive elements (buttons, inputs, drag-and-drop handles) should have clear visual states (hover, focus, active).

## 7. Technical Considerations

- The state of the imported recipe will be managed on the client until the user clicks "Opslaan".
- A client-side mechanism is required to track the "dirty" state of the form to trigger warnings for unsaved changes (see FR-9, FR-10).
- The component structure for the edit form should be modular to be shared seamlessly between the "create/verify" flow and the "edit existing" flow.

## 8. Success Metrics

- Reduction in the number of recipes deleted by users within 5 minutes of being imported.
- Increase in the rate of edits made to newly imported recipes.
- Qualitative user feedback indicating a better sense of control over their recipes.

# PRD: Consistent Back Button Behavior

### 0. Online Resources

- **Jira Ticket:** [BC-245](https://bonchef.atlassian.net/browse/BC-245)

### 1. Introduction/Overview

The current in-app back button exhibits inconsistent and occasionally unintuitive behavior, which can disrupt the user experience. This bug fix aims to address these inconsistencies to provide smoother, more predictable navigation. The primary issues are the back button's destination after saving an edited recipe and its incorrect appearance on modals/overlays.

### 2. Goals

- To prevent users from getting trapped in a navigation loop after saving an edited recipe (e.g., edit -> save -> view -> back to edit).
- To ensure the back button's behavior remains intuitive and predictable during all other navigation flows.
- To clarify and enforce the rule that the back button does not appear on modals or overlays.

### 3. User Stories

- **User Story 1:** As a user, after I finish editing and saving a recipe, I want the back button on the recipe page to take me to a safe fallback page (like `/ontdek`), so I am not sent back to the edit form I just submitted.
- **User Story 2:** As a user, when browsing between different recipe pages, I want the back button to take me to the previous page in my history, as expected.
- **User Story 3:** As a user, when a modal or overlay appears, I want to be certain that the main page's back button is hidden or behind it, so I am not confused about how to close the overlay.

### 4. Functional Requirements

1.  When a user saves a recipe on the `/edit/[id]` page, the server action must redirect them to `/recipes/[id]?from=edit`.
2.  On any page, if the URL contains the query parameter `?from=edit`, the in-app back button must navigate the user to the `/ontdek` page.
3.  If the `?from=edit` query parameter is not present, the back button must perform its standard action (i.e., `router.back()`).
4.  The in-app back button must not be visible on any modal or overlay. The layout should ensure that modals and overlays cover the back button.

### 5. Non-Goals (Out of Scope)

- This fix will not alter the functionality of the browser's native back button.
- A complex, app-wide history tracking system will not be implemented.

### 6. Design Considerations

- The visual design of the existing back button component will remain unchanged.

### 7. Technical Considerations

- Use a URL query parameter (`?from=edit`) on redirect to signal the special navigation context from the server action.
- The `BackButton` component should use the `useSearchParams` hook from `next/navigation` to read the query parameter.
- The save-recipe server action in `src/app/edit/[id]/actions.ts` needs to be modified to append the query parameter to the redirect URL.

### 8. Success Metrics

- Manual testing confirms that the user stories are successfully implemented.
- After saving an edited recipe, the back button on the recipe page correctly navigates to `/ontdek`.
- In all other scenarios, the back button correctly navigates to the previous page in the browser history.
- The back button is not visible when any modal or overlay is active.

### 9. Open Questions

- (None at this time, the fallback to `/ontdek` is a clear and safe default).

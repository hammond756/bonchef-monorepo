# PRD: Profile Page Redesign

## 0. Online Resources

- **Jira Ticket:** [https://bonchef.atlassian.net/browse/BC-227](https://bonchef.atlassian.net/browse/BC-227)
- **Design Mockup:** [Image Provided by User]

## 1. Introduction/Overview

This document outlines the requirements for redesigning the user profile page. The primary goal is to create a visually appealing, shareable page that users can be proud of, aligning it with the provided design mockup. A key part of this effort is to create a reusable `RecipeCard` component that will be used here and later on other pages, such as the "Collections" page.

## 2. Goals

- Update the profile page UI to match the modern aesthetic of the provided mockup.
- Increase user engagement by making the profile page more appealing and shareable.
- Introduce a "Share" button to allow users to easily share their profiles.
- Refactor the recipe display into a reusable `RecipeCard` component.
- Implement a tab-like UI with a single "Recipes" tab to prepare for future expansion.

## 3. User Stories

- As a user, I want my profile page to have a clean and professional design so that I feel proud to share it with others.
- As a user, I want to see all my public recipes clearly displayed on my profile page.
- As a user, I want to be able to "like" recipes directly from the profile page, which should add them to my favorites.
- As a user, I want to be able to easily share my profile page with others via a share button.

## 4. Functional Requirements

1.  **Profile Header:**

    - The header must display the user's circular profile picture, display name, and bio.
    - It should show the total count of the user's public recipes.
    - It must include a "Share" button.
        - _Functionality:_ On click, this button should trigger the native device sharing functionality.
    - The current `EditProfileDialog` button should remain for the profile owner.

2.  **Tab Navigation:**

    - A UI with a single, non-functional tab labeled "Recepten" (Recipes) must be implemented below the profile header.
    - This component should be styled to match our existing tab design but simplified for a single-tab view. It serves as a visual divider and placeholder for future tabs (like "Collections" and "Statistics").

3.  **Recipe Display:**
    - User's public recipes shall be displayed in a grid format, similar to the mockup.
    - Each recipe must be presented using a new, reusable `RecipeCard` component.
    - The `RecipeCard` component must display:
        - The recipe's image as a background.
        - The recipe's title.
        - A "like" button (using our existing heart icon and functionality) instead of the bookmark icon shown in the mockup. Clicking it should function identically to liking a recipe elsewhere in the app.
    - The `RecipeCard` will be implemented with reusability in mind for future use on the "Collections" page.

## 5. Non-Goals (Out of Scope)

- Implementing the "Collections" or "Statistics" tabs. This PRD only covers the UI structure for the tabs.
- Building the "Collections" page itself. The `RecipeCard` will be built to be reusable, but its implementation on other pages is not in scope.
- The "Happy Birthday" overlay or any other special occasion decorations on recipe cards are not part of this implementation.

## 6. Design Considerations

- The implementation must follow the visual guidelines from the provided image.
- Use existing Shadcn UI and Tailwind CSS conventions.
- The page must be responsive and functional across mobile, tablet, and desktop screen sizes.
- The `RecipeCard` should have a clean, modern look with a clear visual hierarchy.

## 7. Technical Considerations

- The existing data fetching logic for profile information and recipes can be reused.
- The new `RecipeCard` component should be created in `/src/components/recipe/` and named `recipe-card.tsx`.
- The like functionality should integrate with the existing user favorites/likes system.

## 8. Success Metrics

- Successful implementation of the new profile page design, as confirmed by visual review against the mockup.
- The "Share" button is functional.
- The "Like" button on `RecipeCard` correctly adds/removes recipes from the user's favorites.
- The `RecipeCard` component is well-structured and reusable.

## 9. Open Questions

- None at this time.

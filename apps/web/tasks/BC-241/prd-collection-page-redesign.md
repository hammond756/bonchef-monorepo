# PRD: Collection Page Redesign

### 0. Online Resources

- **Jira Ticket:** [BC-241](https://bonchef.atlassian.net/browse/BC-241)

### 1. Introduction/Overview

The current collection page (`/collection`) is not aligned with the new house style of the application. The user experience can be improved by making the navigation more accessible and the layout more efficient. This document outlines the requirements to redesign the collection page, focusing on visual consistency and improved usability.

### 2. Goals

- To create a visually consistent experience on the collection page by applying the existing `RecipeCard` component style.
- To improve user navigation by making the view-switching tabs ("Mijn recepten" / "Mijn favorieten") always accessible at the top.
- To increase the information density in the list-view, allowing users to see more of their recipes without excessive scrolling.

### 3. User Stories

- As a user, I want to see my collected recipes in the same style as the rest of the app, so the experience feels coherent and professional.
- As a user, I want to easily switch between 'my recipes' and 'my favorites' without having to scroll back to the top of the page, so I can navigate my collection more efficiently.
- As a user, I want a more compact list view for my recipes so I can see more of them at once on my screen.

### 4. Functional Requirements

1.  **Use `RecipeCard` Component:** The collection page must use the `@/components/recipe/recipe-card.tsx` component to display each recipe in the grid view.
2.  **Intact Interactions:** All existing interactions on the recipe cards, especially the "like" functionality, must remain fully functional.
3.  **Compact List-View:** The list-view should be redesigned to be more compact. Each item should feature a small thumbnail and the recipe title.
4.  **Sticky Navigation Tabs:** The tabs for "Mijn recepten" and "Mijn favorieten", implemented using `@/components/ui/app-tabs.tsx`, must be fixed ("sticky") at the top of the content area, below the main top bar.
5.  **Layout Adjustment:** The page layout needs to be adjusted. The standard `TabLayout` should be modified or replaced to allow the main `TopBar` and `TabBar` to auto-hide on scroll, while the collection page's specific navigation tabs remain persistently visible.

### 5. Non-Goals (Out of Scope)

- This task will not change the backend logic for fetching recipes.
- The core functionality of the like-button itself will not be altered.
- No new types of recipe cards will be created; this task is about reusing existing components.

### 6. Design Considerations

- **Grid View:** Reuse `@/components/recipe/recipe-card.tsx`.
- **Navigation:** Reuse `@/components/ui/app-tabs.tsx`.
- **Compact List View:** A simple row layout with a small thumbnail on the left and text (title) on the right is preferred.
- **Sticky Tabs:** The sticky tab bar should have a solid background color to ensure it's clearly separated from the content scrolling underneath it.

### 7. Technical Considerations

- **Primary File:** `src/app/collection/page.tsx`.
- **Layout:** The layout for the collection page needs significant changes. The logic from `src/components/layouts/tab-layout.tsx` (specifically the `useScrollDirection` hook) can be reused to create the desired scroll behavior for the `TopBar` and `TabBar`, while keeping the new tabs in a fixed position. A new custom layout component might be the cleanest solution.

### 8. Success Metrics

- The recipe cards on the `/collection` page are visually identical to the `RecipeCard` component used elsewhere.
- The like-button on each card is fully functional and correctly reflects the like status.
- The "Mijn recepten" and "Mijn favorieten" tabs are always visible at the top of the page when scrolling through the recipe list.
- The main `TopBar` and `TabBar` correctly hide when scrolling down and reappear when scrolling up.

### 9. Open Questions

- None at this time.

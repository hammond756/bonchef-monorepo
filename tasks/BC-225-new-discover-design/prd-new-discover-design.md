# PRD: Redesign of the Discovery Page

This document outlines the requirements for a complete redesign of the 'Discovery' (`Ontdek`) page, shifting to a more immersive, full-screen, card-based feed.

### 0. Online Resources

- **Jira Ticket:** [BC-225](https://bonchef.atlassian.net/browse/BC-225)
- **Visual Mockup:** [User-Provided Design](https://user-images.githubusercontent.com/12345/image.png) (Note: This is a placeholder link representing the image provided in the prompt).

### 1. Introduction/Overview

To better align with our brand values of being personal and fostering connection, we are redesigning the Discovery page. The current grid-based view will be replaced by a vertical, full-screen feed that emphasizes the story behind each recipe and its creator. This change aims to create a more engaging and visually consistent user experience.

### 2. Goals

- Increase user engagement by making the feed more visually attractive and content-rich.
- Strengthen the sense of community by giving more prominence to the recipe's author and their personal caption.
- Create a consistent and modern user experience that aligns with the visual identity of the recipe detail pages.

### 3. User Stories

- **As a user**, I want to see who posted a recipe and read their caption directly in the feed, so I can better understand the context of the recipe and connect with the creator.
- **As Bonchef**, we want the recipe feed to visually align with our brand values (personal, connecting, growth), so that users have a pleasant and consistent experience across the platform.

### 4. Functional Requirements

#### **FR-A: General Layout**

1.  **Full-Screen Feed:** The page must display a vertical feed of full-screen recipe cards.
2.  **Card Spacing:** Each card must have rounded corners, side margins, and clear vertical whitespace between them.
3.  **Persistent Navigation:** The main top navigation bar (with logo, notifications) and the bottom tab bar must remain fixed and unchanged.
4.  **Search Bar:** A search bar must be integrated into the layout, allowing users to search for recipes, ingredients, or chefs.

#### **FR-B: Card Content & Media**

1.  **Image Aspect Ratio:** Each card's image must be displayed in a 3:4 (portrait) aspect ratio.
2.  **Image Cropping:** Existing images with other aspect ratios must be automatically center-cropped to fit the 3:4 view.
3.  **Caption:** The recipe's `description` will serve as the caption, overlaid on the top portion of the image.
4.  **Expandable Caption:** The caption will initially show a maximum of two sentences, with a "meer" (more) link if the text is longer.
5.  **Caption Expansion:** Clicking "meer" must expand the caption in-place. When expanded, a subtle dark overlay should be applied to the image to enhance text readability.
6.  **Title:** The recipe title must be displayed below the caption in a **bold** font.
7.  **Author:** The author's name must be displayed below the title, formatted as "door @username".

#### **FR-C: Card Interactions**

1.  **Actions:** Each card must feature interactive elements for "Liking" and "Sharing" the recipe.
2.  **Author Avatar:** The author's profile picture must be displayed. Clicking it must navigate the user to the author's profile page.

### 5. Non-Goals (Out of Scope)

- A "Save" (or bookmark) function on the recipe card is not part of this iteration and will be addressed in the future.
- Complex transition animations between cards are not required.

### 6. Design Considerations

- The UI should closely follow the provided visual mockup.
- Action buttons (Like, Share) and the author's avatar should be arranged intuitively, likely stacked vertically on the right side as shown in the mockup.
- All text overlays must have sufficient contrast to be easily readable against a variety of images.

### 7. Technical Considerations

- The existing `description` column in the database will be used for the caption, so no schema change is required for this.
- A robust image processing solution (client-side or server-side) is needed for the 3:4 automatic cropping.
- The component rendering the feed (`PublicRecipeTimeline.tsx`) will require a complete rewrite.

### 8. Success Metrics

- An increase in key user interactions on the Discovery page (e.g., likes, shares, profile clicks).
- A measurable increase in time spent on the Discovery page.
- Positive qualitative feedback from users regarding the new design.

### 9. Open Questions

- The exact placement and styling of the search bar need to be finalized. (Assumption: It will be placed at the top, below the main header).

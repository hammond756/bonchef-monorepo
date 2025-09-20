# PRD: New Import Flow

## 0. Online Resources

- **Jira Ticket:** [https://bonchef.atlassian.net/browse/BC-256](https://bonchef.atlassian.net/browse/BC-256)

## 1. Introduction/Overview

This document describes the functional and product requirements for the redesign of the recipe import flow within the Bonchef application. The current, full-page import feature will be replaced by a non-blocking, contextual overlay. This allows users to import recipes via photo, URL, or text without interrupting their current actions in the app. The new flow focuses on a smooth, asynchronous experience, where processing happens in the background and the user receives immediate visual feedback on the status.

## 2. Goals

- **Improved User Experience:** Make the import flow less disruptive by allowing users to stay in the app and eliminating waiting times.
- **Increase Efficiency:** Enable users to import multiple recipes consecutively without waiting for each individual import process to complete.
- **Clear Feedback:** Provide direct and clear visual feedback on the import status (start, processing, completion, or error).

## 3. User Stories

- As a user, I want to quickly import a recipe from a photo, URL, or text without leaving my current page, so that my workflow is not interrupted.
- As a user, I want a clear overview of my recently imported recipes that are awaiting review, so I know which tasks I still need to complete.
- As a user, I want to receive clear visual feedback (like an animation and a notification badge) when an import starts, so I am confident that my action was successful.

## 4. Functional Requirements

### 4.1 Import Overlay

1.  The existing import page (`/import`) will be replaced.
2.  The import flow is initiated by clicking the central, round plus button in the navigation bar.
3.  On click, an overlay (sheet) slides up from the bottom of the screen.
4.  The overlay displays four options:
    - Photo
    - Website (URL)
    - Text (Note)
    - Chat (marked as out of scope for this implementation).
5.  The user remains on the current page; the overlay is presented on top of it.

### 4.2 Import Type: Photo

1.  Selecting 'Photo' opens a full-screen camera interface.
2.  The interface includes a bottom bar with three buttons:
    - Left: Access to the device's photo gallery.
    - Center: Button to take a photo.
    - Right: 'bonchef!' button with a save icon to start the import.
3.  Above this bar, a semi-transparent strip is visible, showing thumbnails of all photos taken.
4.  After taking a photo, a visual effect (e.g., shutter flash) is shown, and the thumbnail appears in the strip.
5.  Pressing 'bonchef!' closes the camera interface. The import process starts in the background.

### 4.3 Import Type: Website (URL)

1.  After selecting 'Website', the initial overlay animates down and away. A new popup then appears over the original page content.
2.  The popup contains: a title, a brief explanation, a URL input field, and a 'bonchef!' button with a save icon.
3.  Pressing 'bonchef!' starts the URL validation and import.

### 4.4 Import Type: Text / Note

1.  After selecting 'Text', the initial overlay animates down and away, similar to the URL flow. A new popup then appears over the original page content.
2.  The popup contains: a title, an explanation, a large, scrollable text field, and a 'bonchef!' button with a save icon.
3.  Pressing 'bonchef!' starts the text import.

### 4.5 Visual Feedback & Notifications

1.  After successfully starting an import (for Photo, URL, or Text), the interface (popup/sheet) animates towards the 'Collection' icon in the bottom-right of the navigation bar.
2.  Simultaneously, a notification badge (number) appears on the 'Collection' icon.
3.  Each new import process increases the number in the badge by +1.
4.  The badge remains visible as long as there are unreviewed recipes.

### 4.6 Collection Page

1.  Newly imported items appear as tiles in the top-left of the grid on the collection page.
2.  **Tile during processing:**
    - The tile has a soft badge indicating that the item is being processed.
    - Inside this badge, a white 'progress pie chart' is visible.
    - The recipe title is made visible on the tile as soon as possible, so the user knows which item is being processed.
3.  **Tile ready for review:**
    - The tile gets a clear visual indicator _on the tile itself_ (e.g., a 'Ready for review' label) indicating that action is required.
    - Clicking the tile navigates to the existing edit page (`/edit/[id]`).

### 4.7 Review & Finalization

1.  On the edit page, the user can modify and save the recipe.
2.  After saving, the existing popup for choosing 'Publish publicly or privately?' appears.
3.  After the choice is made, the recipe tile on the collection page becomes a regular tile (with photo and title).
4.  The number on the notification badge on the 'Collection' icon is decremented by -1.
5.  When all imported recipes have been processed, the badge disappears completely.

### 4.8 Error Handling

1.  **Immediate URL error:**
    - If a URL returns a 'forbidden' status immediately upon submission, the import process is not started.
    - A toast notification is shown with the message: "Unfortunately, the URL cannot be read. Please try copying the text or taking a screenshot and loading it via another import method."
      . The animation to the collection badge does not occur in this case.
2.  **Error during processing:**
    - If an import process (e.g., URL scraping) fails _after_ it has started, the 'progress pie chart' on the recipe tile changes to a visual error indicator (e.g., an exclamation mark icon).
    - Clicking this error tile displays a popup with the message: "Sorry, we could not retrieve the recipe from [specific information like the URL]. Please try another import method."
    - After clicking 'OK' in the popup, the corresponding tile is removed from the collection page.

## 5. Non-Goals (Out of Scope)

- The 'Chat' import functionality.
- Modifications to the back-end logic for extracting recipe data from photos, URLs, or text. This PRD focuses purely on the front-end flow and user experience.
- Changes to the `/edit/[id]` page itself, outside the reviewing flow.

## 6. Design Considerations

- The UI must follow the Bonchef style: rounded corners, ample whitespace, and the use of Bonchef green for accents.
- The attached image serves as a visual reference for the import overlay.
- Animations should be smooth and functional, guiding the user through the flow (e.g., the animation towards the collection icon).

![Import Overlay](https://user-images.githubusercontent.com/1264536/286337583-05f32a39-5e7e-4a6c-9418-204b341f3e79.png)

## 7. Technical Considerations

- Import processes must be executed asynchronously in the background to avoid blocking the UI.
- The status of import items (pending, processing, ready for review, error) must be stored persistently, so the state is maintained even if the user closes and reopens the app.
- The communication between the start of an import and the UI update (badge, collection page) must be robust.

## 8. Success Metrics

- Increase in the number of imported recipes per user.
- Decrease in the bounce rate on the (old) import page.
- Qualitative feedback from users experiencing the new flow as faster and more pleasant.

## 9. Open Questions

- No open questions at this time.

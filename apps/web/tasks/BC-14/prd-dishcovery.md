# PRD: Dishcovery - Recipe Reconstruction via Photo and Description

## Online Resources

- [Jira Ticket BC-14](https://bonchef.atlassian.net/browse/BC-14)

## 1. Introduction/Overview

Dishcovery is a new functionality that enables users to reconstruct a recipe in front of them through a photo and oral or written explanation. Users take a photo of what's in front of them, add a description, and Bonchef generates a first version of a recipe based on this that is editable and saveable.

**Problem:** Users want to quickly create recipes from dishes they see or eat, without having to manually input all ingredients and steps.

**Goal:** Provide an intuitive way to generate recipes based on visual input and user descriptions, while maintaining user control over the final result.

## 2. Goals

- **Primary:** Users can reconstruct a dish by taking a photo and adding a description
- **Secondary:** Replace the current Chat navigation with Dishcovery to shift focus to recipe creation
- **UX:** Intuitive interface that supports both voice and text input
- **Quality:** Generate usable first versions of recipes that users can edit

## 3. User Stories

- **As a hobby chef** I want to take a photo of a dish I see, so I can reconstruct the recipe
- **As a user** I want to describe my dish via voice, so I can give input quickly and naturally
- **As a user** I want to switch to text input when I can't speak, so I'm flexible in my input method
- **As a user** I want to retake the photo if I'm not satisfied, so I get the best result
- **As a user** I want to receive an editable first version of the recipe, so I can adjust it to my preferences

## 4. Functional Requirements

### 4.1 Navigation and Access

1. The current Chat button in the + overlay is replaced by a Dishcovery button
2. The Dishcovery button uses the scan.svg icon and has the same size as the former Chat button
3. The Chat functionality remains in the code but is no longer accessible via the UI

### 4.2 Camera Functionality

4. The camera opens in the same style as the existing Scan camera
5. Users can only take one photo or choose from the gallery
6. After taking/choosing a photo, the user goes directly to the description screen
7. Users can return to the camera via the back arrow button

### 4.3 Description Screen Layout

8. The photo is displayed 1:1 in the center of the screen
9. Title: "Tell more about this dish"
10. Subtext: "Describe ingredients, flavors, herbs, and everything that's special."

### 4.4 Voice Input (Default)

11. The microphone module is on by default when opening the screen
12. Microphone icon with waves left and right of the mic, which move with speech detection
13. Label shows "Listening..." when active
14. Tapping the mic pauses or restarts listening
15. Label alternates between "Listening..." and "Tap to start speaking"
16. Waves color green when actively listening, gray when paused
17. Maximum recording time: 10 minutes
18. There must actually be voice input detected (not just silence)

### 4.5 Text Input

19. Button "I can't talk now" replaces the mic module with a text field
20. Text field always stays positioned above the keyboard (UI doesn't scroll away)
21. Placeholder text: "Describe the ingredients, flavors, herbs, and preparation method that you see or know..."
22. Text field is limited to approximately 5 lines to keep the page design intact and you can scroll within the text field if more text is entered
23. Button "Rather speak instead" appears to switch back to the microphone module

### 4.6 Input Validation

24. The primary CTA "Bonchef!" is only active when there's a photo AND voice/text input
25. The CTA button is preceded by the ok-hand.svg icon
26. The button is inactive (gray) as long as there's no valid input
27. Voice input must actually contain sound, not just silence

### 4.7 Recipe Generation

28. When clicking "Bonchef!" a recipe_import_job is created
29. Recipe generation happens in the background
30. The recipe is placed as DRAFT in the collection
31. User stays on the current screen and can continue with other activities

## 5. Non-Goals (Out of Scope)

- Real-time transcription of speech while speaking
- Offline functionality
- Integration with existing Chat functionality in the UI
- Fallback mechanisms for failed recipe generation
- Preview of the generated recipe before generation starts
- Specific requirements for photo quality or resolution
- Support for multiple photos per dish

## 6. Design Considerations

- **Photo display:** 1:1 crop in the center of the screen
- **Back button:** Positioned left-top on the photo
- **Microphone module:** Prominently positioned with live feedback via waves
- **Text field:** Appears in the same place as the mic when switching
- **CTA:** Large green button "Bonchef!" always at the bottom, preceded by the ok-hand.svg icon
- **Design tokens:** Use the existing Bonchef design system from `globals.css`
- **Responsive:** Mobile-first approach with focus on touch interactions

## 7. Technical Considerations

- **Camera integration:** Reuse existing Scan camera components and permissions
- **Speech recognition:** Implement pause/restart functionality for the microphone
- **State management:** Manage switching between voice and text modes
- **Input validation:** Validate that there's actually voice input (not just silence)
- **API integration:** Connect to existing recipe generation endpoints
- **Error handling:** Use existing fallback mechanisms for recipe generation
- **Performance:** Optimize for fast camera opening and smooth mode switching
- **Job processing:** Create a new job type and corresponding process function to handle photo and text input together and convert them to a recipe. For now, this can use the existing prompt generate recipe function from the generate recipe service.

## 8. Success Metrics

- **Adoption:** Percentage of users who use Dishcovery after introduction
- **Conversion:** Percentage of users who generate and save a recipe
- **User experience:** Time from photo to generated recipe
- **Input quality:** Percentage of successful recipe generations based on user input

## 9. Open Questions

- How is voice input stored and processed before being sent to the AI?
- What happens if the user closes the app during recipe generation?
- Are there specific accessibility requirements for users with hearing or speech impairments?
- How is the quality of generated recipes measured and improved?

---

**Document version:** 1.0  
**Last updated:** [Date]  
**Author:** [Name]  
**Status:** Concept

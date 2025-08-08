# Recipe Edit Page Refresh - Product Requirements Document

## Online Resources

- Jira Ticket: https://bonchef.atlassian.net/browse/BC-257

## 1. Introduction/Overview

The recipe edit page is a critical touchpoint in the Bonchef user journey, serving as the first impression for users who have just imported a recipe. Currently, the edit page needs a design and functionality refresh to make the editing process more intuitive, reduce friction, and create a sense of pride in users when they first see their imported recipe.

The goal is to transform the edit page into a polished, user-friendly interface that encourages recipe completion and publication while maintaining the existing recipe schema and validation logic.

## 2. Goals

- **Improve User Experience**: Make the edit process more intuitive and visually appealing
- **Reduce Draft Abandonment**: Decrease the number of recipes left in draft status
- **Increase User Pride**: Create a sense of ownership and pride when users first see their imported recipe
- **Streamline Validation**: Integrate with existing validation logic while providing clear feedback
- **Maintain Data Integrity**: Ensure all changes follow the existing recipe schema
- **Optimize for Mobile**: Ensure excellent mobile experience with touch-friendly interactions

## 3. User Stories

### Primary User Stories

- **As a user**, I want to see my imported recipe in a beautiful, polished interface so that I feel proud of my creation
- **As a user**, I want to quickly check and edit my recipe so that I can publish it efficiently
- **As a user**, I want to easily reorder ingredients and groups so that I can organize my recipe logically
- **As a user**, I want to add ingredients and steps quickly so that I can complete my recipe without friction
- **As a user**, I want clear validation feedback so that I know exactly what needs to be fixed before publishing

### Secondary User Stories

- **As a user**, I want to drag and drop ingredients between groups so that I can organize them flexibly
- **As a user**, I want to collapse/expand ingredient groups so that I can focus on specific sections
- **As a user**, I want to see a preview of my recipe image so that I can ensure it looks appealing
- **As a user**, I want to be warned about unsaved changes so that I don't lose my work accidentally

## 4. Functional Requirements

### 4.1 Page Layout & Navigation

1. **Sticky Header**: Must contain back arrow, "Bewerken" title, and prominent "Opslaan" button
2. **Save Button State**: Must be disabled during uploads/generations with clear visual feedback
3. **Navigation Warning**: Must show confirmation dialog when navigating away with unsaved changes

### 4.2 Recipe Information Section

4. **Recipe Image**: Must display in 3:4 aspect ratio with photo icon overlay for editing
5. **Image Actions**: Must support photo capture, gallery selection, and AI generation
6. **Recipe Title**: Must be inline editable with border styling
7. **Cooking Time**: Must accept only numeric input (minutes)
8. **Servings Counter**: Must use +/- buttons (no free text input)
9. **Description**: Must support multiline text input with auto-resize
10. **Source Field**: Must accept single-line text input

### 4.3 Ingredient Groups & Ingredients

11. **Group Management**: Must support inline editing of group titles
12. **Group Reordering**: Must support drag & drop for entire groups
13. **Group Collapse**: Must support expand/collapse with chevron indicators
14. **Group Deletion**: Must show warning popup when deleting groups with ingredients
15. **Ingredient Structure**: Must have three fields: quantity (number), unit (text), ingredient name (text)
16. **Ingredient Reordering**: Must support drag & drop within groups and between groups
17. **Ingredient Deletion**: Must support individual ingredient removal
18. **Empty Group Handling**: Must not display or save groups with no ingredients
19. **Add Buttons**: Must have "Add Ingredient" and "Add Group" buttons always visible

### 4.4 Preparation Steps

20. **Step Management**: Must support text input with auto-resize
21. **Step Reordering**: Must support drag & drop for step reordering
22. **Step Deletion**: Must support individual step removal
23. **Add Step Button**: Must be prominently displayed below steps

### 4.5 Validation & Error Handling

24. **Field Validation**: Must show red borders and error messages for invalid required fields
25. **Real-time Feedback**: Must provide immediate visual feedback for validation errors
26. **Blocking States**: Must disable save button during uploads/generations
27. **Error Prevention**: Must prevent saving with validation errors

### 4.6 Data Integration

28. **Schema Compliance**: Must follow existing recipe schema structure
29. **Validation Integration**: Must integrate with existing validation logic
30. **Optimistic Updates**: Must provide immediate UI feedback for user actions

## 5. Non-Goals (Out of Scope)

- Recipe templates or bulk ingredient import
- Recipe sharing during editing process
- Advanced ingredient validation against external databases
- Recipe versioning or history tracking
- Collaborative editing features
- Recipe duplication or cloning
- Advanced formatting options for descriptions or steps
- Integration with external recipe APIs

## 6. Design Considerations

### 6.1 Visual Design

- **Follow Design System**: Must use tokens from `globals.css` (colors, fonts, spacing, border-radius)
- **Mobile-First**: Must prioritize mobile experience with touch-friendly interactions
- **Clean Layout**: Must use ample white space and clear visual hierarchy
- **Consistent Styling**: Must match existing app design patterns and components

### 6.2 Interaction Design

- **Drag & Drop**: Must provide clear visual feedback during drag operations
- **Inline Editing**: Must support seamless inline text editing
- **Touch Optimization**: Must ensure all interactive elements are touch-friendly
- **Loading States**: Must show appropriate loading indicators during operations

### 6.3 Accessibility

- **Keyboard Navigation**: Must support full keyboard navigation
- **Screen Reader Support**: Must provide appropriate ARIA labels
- **Color Contrast**: Must meet WCAG contrast requirements
- **Focus Management**: Must maintain logical focus order

## 7. Technical Considerations

### 7.1 Data Handling

- **Service Pattern**: Must follow the data-handling pattern with shared/client/server services
- **SWR Integration**: Must use SWR for data fetching with optimistic updates
- **Error Handling**: Must implement proper error boundaries and user feedback
- **Validation**: Must integrate with existing validation logic

### 7.2 Performance

- **Optimistic UI**: Must provide immediate feedback for user actions
- **Efficient Re-renders**: Must minimize unnecessary component re-renders
- **Lazy Loading**: Must implement lazy loading for non-critical components
- **Memory Management**: Must properly clean up event listeners and subscriptions

### 7.3 Mobile Considerations

- **Touch Targets**: Must ensure minimum 44px touch targets
- **Scroll Behavior**: Must implement smooth scrolling with proper overscroll handling
- **Viewport Management**: Must handle mobile keyboard appearance properly
- **Gesture Support**: Must support native mobile gestures where appropriate

## 8. Success Metrics

### 8.1 Primary Metrics

- **Draft Completion Rate**: Increase in recipes moved from draft to published status
- **Edit Session Duration**: Decrease in time spent on edit page
- **User Satisfaction**: Positive feedback from user testing sessions

### 8.2 Secondary Metrics

- **Validation Error Rate**: Decrease in validation errors during editing
- **Navigation Abandonment**: Decrease in users leaving without saving
- **Feature Adoption**: Increase in use of drag & drop and grouping features

## 9. Open Questions

1. **Image Upload Limits**: What are the file size and format restrictions for recipe images?
2. **Auto-save Frequency**: Should the system auto-save changes, and if so, how frequently?
3. **Undo/Redo**: Should we implement undo/redo functionality for edit operations?
4. **Bulk Operations**: Should we support bulk selection and operations for ingredients/steps?
5. **Keyboard Shortcuts**: Should we implement keyboard shortcuts for common actions?
6. **Preview Mode**: Should we add a preview mode to see how the recipe will appear when published?
7. **Performance Benchmarks**: What are the acceptable load times and interaction response times?
8. **Error Recovery**: How should the system handle network failures during save operations?

## 10. Implementation Phases

### Phase 1: Core UI Refresh

- Update page layout and header design
- Implement new styling using design system tokens
- Add basic drag & drop functionality for ingredients and steps

### Phase 2: Advanced Interactions

- Implement group management (add, delete, reorder)
- Add collapse/expand functionality for groups
- Implement cross-group ingredient dragging

### Phase 3: Validation & Polish

- Integrate with existing validation logic
- Add unsaved changes warning
- Implement optimistic updates and error handling

### Phase 4: Testing & Optimization

- Performance optimization
- Accessibility improvements
- User testing and feedback incorporation

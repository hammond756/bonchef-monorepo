# PRD: Recipe State Persistence

## Online Resources

No linked Jira ticket

## Introduction/Overview

This feature addresses the user experience issue where recipe page state (portion scaling, checked ingredients, and checked preparation steps) is lost when navigating between tabs or sharing recipe links. Users currently lose their progress when switching from ingredients to preparation tabs, and cannot share their cooking progress with others. The goal is to persist this state client-side without database dependencies, enabling seamless navigation and shareable cooking progress.

## Goals

1. **Maintain Recipe State Across Tab Navigation**: Users can switch between ingredients and preparation tabs without losing portion scaling, checked ingredients, or checked steps
2. **Enable State Sharing**: Users can share recipe links that preserve their current cooking progress
3. **Client-Side Only**: Implement state persistence without database dependencies
4. **URL Length Optimization**: Ensure state data is encoded compactly to stay well under 256 character limit
5. **Graceful Fallback**: Handle cases where state restoration fails gracefully with user notification

## User Stories

1. **As a user cooking a recipe**, I want to navigate between ingredients and preparation tabs without losing my portion scaling, so I don't accidentally add 2x the salt when switching views.

2. **As a user**, I want to share a pre-checked list of ingredients with my partner so they can pick up the remaining groceries at the shop.

3. **As a user**, I want to resume cooking from where I left off after closing the browser or navigating away, so I don't lose my progress.

4. **As a user sharing a recipe**, I want the option to include or exclude my current cooking state, so I can share either a clean recipe or one with my progress.

## Functional Requirements

1. **State Persistence**: The system must persist the following recipe state elements:
    - Portion count/multiplier (e.g., 2x, 0.5x)
    - Checked/unchecked ingredients
    - Checked/unchecked preparation steps

2. **Tab Navigation State Preservation**: When users switch between recipe tabs (ingredients, preparation), all state must be maintained without loss.

3. **URL State Encoding**: State must be encoded into the URL in a compact format that stays well under 256 characters.

4. **State Restoration**: When opening a recipe link with state, the system must restore the exact portion scaling, ingredient checks, and step checks.

5. **Share Button Enhancement**: The existing share button must show a popover modal when there is "dirty state" (modified from default), asking users if they want to include state in the shared link.

6. **Default Share Behavior**: When sharing, the default option must be "no state" to ensure clean recipe sharing by default.

7. **State Validation**: If a shared link contains invalid or corrupted state data, the recipe must load with clean state and show an info-level toast notification.

8. **No Visual State Indicators**: Beyond the share button popover, no additional visual indicators should show that state is being persisted.

9. **Universal Recipe Support**: This feature must work on every recipe page in the application.

## Non-Goals (Out of Scope)

1. **Selected Tab Persistence**: The currently selected tab is not part of the persisted state
2. **Database Storage**: No database dependencies or server-side state storage
3. **Complex State History**: No undo/redo functionality or state versioning
4. **Cross-Device Sync**: State is not synchronized across different devices or browsers
5. **Recipe Modification Handling**: No special handling when recipes are updated/modified
6. **State Analytics**: No tracking of what state users are persisting

## Design Considerations

- **Share Button Popover**: When state is modified, the share icon should display a modal asking "Include your cooking progress (checked items, portion scaling) in the shared link?" with Yes/No options
- **Default Selection**: The "No" option should be pre-selected by default
- **Modal Design**: Use existing modal components and styling from the design system
- **Toast Notifications**: Use existing toast system for state restoration failure notifications

## Technical Considerations

- **URL Encoding**: Implement compact encoding (e.g., base64, custom binary encoding) to minimize URL length
- **State Serialization**: Create efficient serialization format for recipe state data
- **URL Length Management**: Implement encoding that guarantees URLs stay well under 256 characters
- **State Validation**: Add validation to ensure corrupted state data doesn't break recipe display
- **Existing Share Logic**: Integrate with current share functionality without breaking existing features
- **Client-Side Storage**: Use URL parameters and/or localStorage as fallback for state persistence

## Success Metrics

1. **User Experience**: Reduced user frustration with lost recipe progress
2. **Sharing Engagement**: Increased number of shared recipe links
3. **Navigation Retention**: Users maintain state when switching between recipe tabs
4. **Error Handling**: Graceful fallback when state restoration fails

## Open Questions

1. **State Compression**: What is the optimal encoding format to balance URL length with data integrity?
2. **State Size Limits**: What is the maximum reasonable state size we should support?
3. **Browser Compatibility**: Are there any browser-specific limitations for URL length or encoding we should consider?
4. **Performance Impact**: What is the acceptable performance impact of state serialization/deserialization?

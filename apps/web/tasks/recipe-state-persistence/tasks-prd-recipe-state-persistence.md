# Tasks: Recipe State Persistence

## Relevant Files

- `src/hooks/use-recipe-state.ts` - Custom hook for managing recipe state persistence and restoration
- `src/hooks/use-recipe-state.test.ts` - Unit tests for the recipe state hook
- `src/lib/utils/recipe-state-encoder.ts` - Utility functions for encoding/decoding recipe state to/from URL parameters
- `src/lib/utils/recipe-state-encoder.test.ts` - Unit tests for state encoding utilities
- `src/components/recipe/recipe-state-provider.tsx` - Context provider for recipe state management
- `src/components/recipe/recipe-state-provider.test.tsx` - Unit tests for the state provider
- `src/components/recipe/share-recipe-button.tsx` - Enhanced share button with state inclusion options
- `src/components/recipe/share-recipe-button.test.tsx` - Unit tests for the enhanced share button
- `src/components/ui/state-share-modal.tsx` - AlertDialog component for choosing state inclusion when sharing
- `src/components/ui/state-share-modal.test.tsx` - Unit tests for the state share modal
- `src/app/recipes/[slug]/page.tsx` - Recipe page that integrates with state persistence
- `src/app/recipes/[slug]/page.test.tsx` - Integration tests for recipe page state persistence

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Core State Management Infrastructure
    - [x] 1.1 Create recipe state types and interfaces for portion scaling, checked ingredients, and checked steps
    - [x] 1.2 Implement recipe state context provider with state management logic
    - [x] 1.3 Create custom hook for recipe state operations (get, set, clear, check if dirty)
    - [x] 1.4 Add unit tests for state management infrastructure
- [ ] 2.0 State Serialization & URL Encoding
    - [x] 2.1 Implement compact state serialization format for recipe state data
    - [x] 2.2 Create URL parameter encoding/decoding utilities with length optimization
    - [x] 2.3 Add state compression to ensure URLs stay well under 256 characters
    - [x] 2.4 Implement unit tests for encoding/decoding functionality
- [ ] 3.0 State Restoration & Validation
    - [x] 3.1 Build state restoration logic from URL parameters on page load
    - [x] 3.2 Implement state validation with graceful fallback for corrupted data
    - [x] 3.3 Add toast notifications for state restoration failures
    - [x] 3.4 Create unit tests for restoration and validation logic
- [ ] 4.0 Share Button Enhancement
    - [x] 4.1 Modify existing share button to detect dirty state and show state inclusion modal
    - [x] 4.2 Create state share AlertDialog component with Yes/No options (defaulting to No)
    - [x] 4.3 Integrate state inclusion logic with existing share functionality
    - [x] 4.4 Add unit tests for share button enhancements
- [ ] 5.0 Integration & Testing
    - [x] 5.1 Integrate state persistence with recipe page components (ingredients, preparation steps)
    - [x] 5.2 Ensure state persists across tab navigation within recipe pages
    - [ ] 5.3 Add end-to-end tests for complete state persistence workflow
    - [ ] 5.4 Perform integration testing and bug fixes

# Task List: PostHog Events Instrumentation

**Online Resources:** https://bonchef.atlassian.net/browse/BC-284

## Relevant Files

- `lib/analytics/events.ts` - Contains Zod schemas and event definitions for all PostHog events
- `lib/analytics/events.test.ts` - Unit tests for event schemas and validation
- `lib/posthog.ts` - PostHog client configuration and helper functions
- `lib/posthog.test.ts` - Unit tests for PostHog utilities
- `src/components/PostHogProvider.tsx` - PostHog provider component (existing)
- `src/hooks/use-recipe-likes.tsx` - Hook for recipe likes functionality (existing)
- `src/hooks/use-bookmarked-recipes.tsx` - Hook for bookmark functionality (existing)
- `src/hooks/use-comments.ts` - Hook for comments functionality (existing)
- `src/hooks/use-own-recipes.tsx` - Hook for user's own recipes (existing)
- `src/hooks/use-recipe-likes.test.tsx` - Unit tests for recipe likes hook
- `src/hooks/use-bookmarked-recipes.test.tsx` - Unit tests for bookmark hook
- `src/hooks/use-comments.test.ts` - Unit tests for comments hook
- `src/services/recipe-service.ts` - Recipe service for database operations (existing)
- `src/components/recipe/recipe-action-buttons.tsx` - Component with like/bookmark buttons (existing)
- `src/components/comment-button.tsx` - Comment functionality component (existing)
- `src/components/recipe-form.tsx` - Recipe creation form (existing)
- `src/app/edit/[id]/actions.ts` - Recipe editing actions (existing)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest run [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Set up PostHog Analytics Infrastructure
    - [x] 1.1 Create Zod schemas for all event types in `lib/analytics/events.ts`
    - [x] 1.2 Implement `trackLatestEvent()` helper function in `lib/posthog.ts`
    - [x] 1.3 Add versioning support for all events
    - [x] 1.5 Create database utility functions for querying user recipe counts and ownership

- [ ] 2.0 Implement Recipe Added Event (`added_recipe`)
    - [x] 2.1 Add event trigger to recipe creation services
    - [x] 2.2 Implement database query for `recipe_count_before` property with null fallback on network failure
    - [x] 2.3 Add event firing to recipe form submission
    - [x] 2.4 Add event firing to recipe import functionality
    - [x] 2.5 Handle different input methods (url, photo, note, chat)
    - [ ] 2.6 Add unit tests for recipe added event functionality

- [ ] 3.0 Implement Recipe Bookmark Events (`added_bookmark`, `removed_bookmark`)
    - [ ] 3.1 Integrate event triggers into `useBookmarkedRecipes` hook
    - [ ] 3.2 Add database query for `is_own_recipe` property with null fallback on network failure
    - [ ] 3.3 Update bookmark button components to fire events
    - [ ] 3.4 Add event firing to bookmark toggle functionality
    - [ ] 3.5 Add unit tests for bookmark event functionality

- [ ] 4.0 Implement Recipe Like Events (`liked_recipe`, `unliked_recipe`)
    - [ ] 4.1 Integrate event triggers into `useRecipeLikes` hook
    - [ ] 4.2 Add database query for `is_own_recipe` property with null fallback on network failure
    - [ ] 4.3 Update like button components to fire events
    - [ ] 4.4 Add event firing to like toggle functionality
    - [ ] 4.5 Add unit tests for like event functionality

- [ ] 5.0 Implement Recipe Comment Events (`added_comment`, `removed_comment`)
    - [ ] 5.1 Integrate event triggers into `useComments` hook
    - [ ] 5.2 Add database query for `is_own_recipe` property with null fallback on network failure
    - [ ] 5.3 Implement `comment_length` calculation
    - [ ] 5.4 Update comment components to fire events
    - [ ] 5.5 Add event firing to comment submission and removal
    - [ ] 5.6 Add unit tests for comment event functionality

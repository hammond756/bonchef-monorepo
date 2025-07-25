# Task List: Recipe Comments Feature

## Relevant Files

### Database & Backend

- `supabase/migrations/[timestamp]_create_comments_table.sql` - Database migration for comments table
- `src/app/api/recipes/[id]/comments/route.ts` - API endpoint to fetch comments for a recipe
- `src/app/api/recipes/[id]/comments/route.ts` - API endpoint to create a new comment
- `src/app/api/comments/[id]/route.ts` - API endpoint to delete a comment
- `src/lib/services/comment-service.ts` - Business logic for comment operations
- `src/lib/services/comment-service.test.ts` - Unit tests for comment service

### UI Components

- `src/components/comment-button.tsx` - Reusable comment button component
- `src/components/comment-button.test.tsx` - Unit tests for comment button
- `src/components/comment-overlay.tsx` - Slide-up overlay for comments
- `src/components/comment-overlay.test.tsx` - Unit tests for comment overlay
- `src/components/comment-list.tsx` - Scrollable list of comments
- `src/components/comment-list.test.tsx` - Unit tests for comment list
- `src/components/comment-input.tsx` - Input field for creating comments
- `src/components/comment-input.test.tsx` - Unit tests for comment input
- `src/components/comment-item.tsx` - Individual comment display component
- `src/components/comment-item.test.tsx` - Unit tests for comment item

### Hooks & State Management

- `src/hooks/use-comments.ts` - Hook for fetching and managing comments
- `src/hooks/use-comments.test.ts` - Unit tests for use-comments hook
- `src/hooks/use-comment-actions.ts` - Hook for comment creation/deletion
- `src/hooks/use-comment-actions.test.ts` - Unit tests for use-comment-actions hook

### Integration Points

- `src/components/recipe/recipe-action-buttons.tsx` - Update to include comment button
- `src/components/recipe/recipe-action-buttons.test.tsx` - Update tests for action buttons
- `src/lib/types.ts` - Add comment-related TypeScript types
- `src/lib/utils.ts` - Add utility functions for timestamp formatting

### Tests

- `src/tests/e2e/comment-flow.spec.ts` - E2E tests for complete comment flow
- `src/tests/e2e/comment-authentication.spec.ts` - E2E tests for auth integration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Follow existing patterns from like/bookmark buttons for authentication integration.
- Reuse existing overlay animation patterns from import functionality.

## Tasks

- [x] 1.0 Database Setup & Backend Infrastructure
    - [x] 1.1 Create database migration for comments table with proper indexes
    - [x] 1.2 Create comment service with CRUD operations
    - [x] 1.3 Add comment-related TypeScript types to lib/types.ts
    - [x] 1.4 Create API endpoint for fetching comments (GET /api/recipes/[id]/comments)
    - [x] 1.5 Create API endpoint for creating comments (POST /api/recipes/[id]/comments)
    - [x] 1.6 Create API endpoint for deleting comments (DELETE /api/comments/[id])
    - [x] 1.7 Add utility function for relative timestamp formatting
    - [x] 1.8 Write unit tests for comment service and API endpoints

- [x] 2.0 Comment Button Component & Integration
    - [x] 2.1 Create CommentButton component with dark/light theme support
    - [x] 2.2 Add comment count display below button
    - [x] 2.3 Implement low opacity styling for dark mode
    - [x] 2.4 Add comment button to RecipeActionButtons component
    - [x] 2.5 Create use-comments hook for fetching comment counts
    - [x] 2.6 Write unit tests for CommentButton component
    - [x] 2.7 Update RecipeActionButtons tests to include comment button

- [x] 3.0 Comment Overlay & Display Components
    - [x] 3.1 Create CommentOverlay component with slide-up animation
    - [x] 3.2 Implement overlay dismissal (X button and outside click)
    - [x] 3.3 Create CommentList component with scrollable content
    - [x] 3.4 Create CommentItem component for individual comments
    - [x] 3.5 Add recipe description display at top of overlay
    - [x] 3.6 Implement proper z-index to appear over tab bar
    - [x] 3.7 Add loading states for comment fetching
    - [x] 3.8 Write unit tests for overlay and display components

- [x] 4.0 Comment Creation & Management
    - [x] 4.1 Create CommentInput component with character limit (500)
    - [x] 4.2 Add current user avatar display in input field
    - [x] 4.3 Implement send button with paper plane icon
    - [x] 4.4 Create use-comment-actions hook for create/delete operations
    - [x] 4.5 Add optimistic updates for immediate comment display
    - [x] 4.6 Implement comment deletion functionality (owner only)
    - [x] 4.7 Add error handling for comment operations
    - [x] 4.8 Write unit tests for comment creation and management

- [x] 5.0 Authentication Integration & Polish
    - [x] 5.1 Implement login redirect for non-authenticated users
    - [x] 5.2 Add appropriate error messages for auth failures
    - [x] 5.3 Follow existing auth patterns from like/bookmark buttons
    - [x] 5.4 Add proper focus management for accessibility
    - [x] 5.5 Implement keyboard navigation support
    - [x] 5.6 Add ARIA labels for screen readers
    - [x] 5.7 Create E2E tests for complete comment flow
    - [x] 5.8 Create E2E tests for authentication integration
    - [x] 5.9 Final UI/UX polish and performance optimization

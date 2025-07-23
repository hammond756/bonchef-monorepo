# Product Requirements Document: Recipe Likes Feature

## Online Resources

- **Jira Ticket:** [BC-19](https://bonchef.atlassian.net/browse/BC-19)

## Introduction/Overview

This feature adds the ability for users to "like" recipes, providing a way to show appreciation and engagement with content. Users will be able to like/unlike recipes through a heart icon button, and the total like count will be displayed. This feature aims to increase user engagement and provide social validation for recipe creators.

## Goals

1. Enable users to express appreciation for recipes through likes
2. Provide social validation and recognition for recipe creators
3. Increase user engagement on the platform
4. Create a foundation for future social features and recommendation algorithms

## User Stories

- **As a user**, I want to like recipes so that I can show the creator that I find their recipe interesting
- **As a home chef**, I want to like recipes so that I can give recognition to other creators
- **As a user**, I want to see how many likes a recipe has received so that I can gauge its popularity
- **As a recipe creator**, I want to see likes on my recipes so that I know which content resonates with users

## Functional Requirements

### Core Functionality

1. **Like Button**: Add a heart-shaped like button to the recipe action buttons component
2. **Toggle Behavior**: Users must be able to like and unlike recipes (toggle functionality)
3. **Self-Liking**: Users must be able to like their own recipes
4. **Like Count Display**: Display the total number of likes directly under the heart icon
5. **Visual Feedback**:
    - Empty heart icon for unliked recipes
    - Filled red heart icon for liked recipes
6. **Authentication Requirement**: Non-authenticated users must be redirected to login page when attempting to like (same logic as bookmark button)

### Database Implementation

7. **New Table**: Create `recipe_likes` table in Supabase with the following structure:
    - `id` (UUID, primary key)
    - `recipe_id` (UUID, foreign key to recipes table)
    - `user_id` (UUID, foreign key to profiles table)
    - `created_at` (timestamp)
    - Unique constraint on `(recipe_id, user_id)` to prevent duplicate likes
8. **Data Persistence**: Store who liked what recipe for future feature development
9. **Cascade Deletion**: When a recipe is deleted, all associated likes must be automatically deleted

### UI Integration

10. **Recipe Card Integration**: Add like button to recipe cards on the discovery page
11. **Recipe Detail Integration**: Add like button to recipe detail pages
12. **Consistent Styling**: Like count must use exactly the same design as bookmark count in terms of font, size, and placement
13. **Count Formatting**: Format large numbers as "1k", "1.1k", etc. starting from 1,000

### Data Constraints

14. **One Like Per User**: Each user can only like a recipe once
15. **Real-time Updates**: Like count should update immediately when toggled

## Non-Goals (Out of Scope)

- Showing individual users who liked a recipe
- Displaying liked recipes on user profiles
- Like notifications to recipe creators
- Advanced analytics or tracking beyond basic functionality
- Rate limiting or spam prevention (beyond one-like-per-user constraint)

## Design Considerations

- **Visual Design**: Follow existing design system and action button patterns
- **Icon Usage**: Use heart icon consistent with common social media conventions
- **Color Scheme**: Red fill for liked state, follow existing theme variants (light/dark)
- **Accessibility**: Ensure proper ARIA labels and keyboard navigation
- **Responsive Design**: Maintain mobile-first approach consistent with existing action buttons

## Technical Considerations

- **Component Extension**: Extend existing `RecipeActionButtons` component
- **Database**: Use Supabase for data storage and real-time updates
- **Authentication**: Integrate with existing auth system
- **State Management**: Follow existing patterns used in bookmark functionality
- **API Design**: Create new API endpoints following existing conventions
- **Performance**: Consider implementing optimistic updates for better UX

## Success Metrics

- **Engagement Comparison**: Monitor whether recipes receive more likes or bookmarks to understand user behavior
- **Feature Adoption**: Track percentage of users who use the like functionality
- **Content Engagement**: Monitor average likes per recipe over time

## Implementation Phases

### Phase 1: Core Functionality

- Database table creation and migration
- Like/unlike API endpoints
- Basic UI components (heart button + count)
- Integration with recipe cards and detail pages

### Phase 2: Polish & Optimization

- Number formatting for large counts
- Performance optimizations
- Enhanced visual feedback and animations
- Comprehensive testing

## Open Questions

- Should there be any rate limiting beyond the one-like-per-recipe constraint?
- Do we want to track any additional metadata (e.g., like/unlike events for analytics)?
- Should the like button have hover states or animation effects?

## Acceptance Criteria

- [ ] Users can like recipes on recipe detail pages
- [ ] Users can like recipes on recipe cards (discovery page)
- [ ] Like count is visible on recipe cards
- [ ] Like count is visible on recipe detail pages
- [ ] Visual state clearly indicates liked vs unliked recipes
- [ ] Non-authenticated users are redirected to login when attempting to like
- [ ] Users can unlike previously liked recipes
- [ ] Like counts update in real-time
- [ ] Database properly stores like relationships
- [ ] Large numbers are formatted appropriately (1k, 1.1k, etc.)

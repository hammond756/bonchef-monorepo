# Product Requirements Document: PostHog Events Instrumentation

**Online Resources:** https://bonchef.atlassian.net/browse/BC-284

## 1. Introduction/Overview

This feature implements comprehensive analytics tracking using PostHog to monitor user engagement with recipe-related actions. The implementation will track key user behaviors including recipe creation, bookmarking, liking, and commenting to provide insights into user activation, engagement patterns, and feature adoption.

The goal is to establish a robust analytics foundation that enables data-driven product decisions while maintaining clean, consistent event schemas.

## 2. Goals

- **Track User Activation:** Monitor recipe creation patterns to understand user onboarding and retention
- **Measure Engagement:** Quantify user interactions with recipes (likes, bookmarks, comments)
- **Enable Feature Analysis:** Provide data to evaluate feature adoption and usage patterns
- **Support Product Decisions:** Generate insights for product roadmap and feature prioritization
- **Maintain Data Quality:** Ensure consistent, reliable analytics data through proper validation

## 3. User Stories

- As a product analyst, I want to track when users add recipes so I can understand activation patterns and user progression
- As a product manager, I want to monitor bookmark and like interactions so I can identify popular content and user engagement
- As a developer, I want to use standardized event schemas so I can maintain consistent analytics implementation
- As a data scientist, I want reliable event data so I can perform accurate user behavior analysis

## 4. Functional Requirements

### 4.1 Recipe Added Event (`added_recipe`)

1. **Event Trigger:** Fire immediately after successful recipe creation, regardless of input method
2. **Properties Required:**
    - `method` (string): Input method used ("url", "photo", "note", "chat")
    - `source_url` (string, optional but required for url method)
    - `recipe_count_before` (number): Total recipes user had before this addition
    - `recipe_id` (string): Unique recipe identifier (UUID)
    - `created_at` (datetime): When recipe was added
    - `stage` (string): Stage of adding ("draft", "published")
3. **Database Integration:** Query user's recipe count from database before sending event
4. **Error Handling:** Set properties to `null` if database query fails due to network issues

### 4.2 Recipe Bookmark Events (`added_bookmark`, `removed_bookmark`)

1. **Event Trigger:** Fire when bookmark button is clicked and action is successfully processed
2. **Properties Required:**
    - `recipe_id` (string): Unique recipe identifier
3. **Implementation:** Separate events for add/remove actions (no status property)

### 4.3 Recipe Like Events (`liked_recipe`, `unliked_recipe`)

1. **Event Trigger:** Fire when like button is clicked and action is successfully processed
2. **Properties Required:**
    - `recipe_id` (string): Unique recipe identifier
3. **Implementation:** Separate events for like/unlike actions (no status property)

### 4.4 Recipe Comment Events (`added_comment`, `removed_comment`)

1. **Event Trigger:** Fire immediately after successful comment submission or removal
2. **Properties Required:**
    - `recipe_id` (string): Unique recipe identifier
    - `comment_id` (string): Unique comment identifier (for added_comment only)
3. **Implementation:** Separate events for add/remove actions (no status property)

### 4.5 Technical Implementation Requirements

1. **Event Schema Validation:** Use Zod schemas for all events in `lib/analytics/events.ts`
2. **Versioned Events:** Implement versioning using `version` property for all events
3. **Centralized Tracking:** Use `trackLatestEvent()` helper for all event tracking
4. **Hook Integration:** Place event triggers in existing data manipulation hooks
5. **Testing:** Add assertions using mocked `trackEvent` function in component tests

## 5. Non-Goals (Out of Scope)

- **Real-time Analytics Dashboard:** This PRD focuses on event implementation, not dashboard creation
- **Advanced Analytics Features:** Complex funnel analysis or cohort tracking beyond basic event tracking
- **Data Export/Import:** Custom data export functionality for analytics data
- **User Privacy Controls:** GDPR compliance features beyond basic data collection
- **Custom Event Visualization:** Building custom charts or visualizations in the app
- **A/B Testing Integration:** PostHog A/B testing feature implementation

## 6. Design Considerations

### 6.1 Event Naming Convention

- Use `verb_object` format (e.g., `added_recipe`, `added_bookmark`)
- Use snake_case for all property names
- Separate events for opposite actions (add/remove, like/unlike)

### 6.2 Error Handling Strategy

- Network failures should result in `null` values for database-dependent properties
- PostHog handles offline queuing automatically
- No custom retry logic required

### 6.3 Testing Strategy

- Mock `trackEvent` function in component tests
- Add assertions to verify correct event firing
- Test both success and failure scenarios

## 7. Technical Considerations

### 7.1 Integration Points

- **Existing Hooks:** Integrate with `useRecipeLikes`, `useBookmarkedRecipes`, `useComments`
- **Recipe Services:** Add events to recipe creation services
- **PostHog Provider:** Leverage existing `PostHogProvider.tsx` component

### 7.2 Database Queries

- Query user recipe count before sending `added_recipe` event
- Handle database connection failures gracefully
- Use existing Supabase client for queries
- Note: Ownership information can be joined later in the data lake

### 7.3 Performance Considerations

- Events should not block user interactions
- Database queries for event properties should be optimized
- Consider caching user recipe count for performance

## 8. Success Metrics

- **Event Coverage:** 100% of target user actions tracked with proper properties
- **Data Quality:** <1% of events with null values due to network failures
- **Implementation Speed:** All events implemented within 2 weeks
- **Test Coverage:** 90% of event-triggering components have proper test assertions

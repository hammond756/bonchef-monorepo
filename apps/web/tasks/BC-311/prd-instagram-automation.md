# Product Requirements Document: Instagram Post Automation

## Online Resources

- **Jira Ticket:** https://bonchef.atlassian.net/browse/BC-311

## Introduction/Overview

This feature automates the posting of selected recipes to Instagram to increase social media engagement and reach for marketing purposes. The system will automatically post recipes from our database to Instagram at predetermined times using Meta Business Suite API integration. This will help with growth hacking and increase our social media presence without manual intervention.

## Goals

1. Automate Instagram posting of selected recipes at fixed weekly intervals
2. Generate engaging captions using AI (Langfuse) based on recipe data
3. Reduce manual effort for social media marketing
4. Increase Instagram engagement and reach
5. Maintain consistent posting schedule (3 times per week)

## User Stories

- **As a founder**, I want to manually select recipes for Instagram posting so that I can control which content gets shared
- **As a founder**, I want recipes to be automatically posted at scheduled times so that I don't have to remember to post manually
- **As a founder**, I want AI-generated captions that include recipe details so that posts are engaging and informative
- **As a founder**, I want to track which recipes have been posted so that I can monitor the automation system
- **As a founder**, I want to receive notifications when posts fail so that I can take corrective action

## Functional Requirements

1. **Database Table Creation**
    - Create `recipe_repost_queue` table in Supabase with columns:
        - `id` (UUID, primary key)
        - `recipe_id` (UUID, foreign key to recipes table)
        - `scheduled_date` (timestamp)
        - `is_posted` (boolean, default false)
        - `posted_at` (timestamp, nullable)
        - `instagram_post_id` (text, nullable)
        - `instagram_post_url` (text, nullable)
        - `error_message` (text, nullable)
        - `created_at` (timestamp)
        - `updated_at` (timestamp)

2. **Recipe Selection**
    - Only recipes with `is_public = true` can be added to the queue
    - Manual selection process (no automatic criteria for now)

3. **Scheduling System**
    - Fixed posting schedule (CET timezone):
        - Tuesday at 12:30 CET
        - Thursday at 17:00 CET
        - Saturday at 10:00 CET
    - Job runs to check for scheduled posts (frequency to be determined to avoid API overloading)

4. **Content Generation**
    - AI service using Langfuse to generate Instagram captions
    - Caption includes: recipe name, source name (following existing logic from discover page), ingredients, instructions
    - Caption must not exceed 2200 characters (Instagram limit)
    - Service located in new `/instagram-repost-job` folder

5. **Instagram API Integration**
    - Use Meta Business Suite API (v23.0)
    - Implement 3-step posting process:
        1. Get Instagram Business ID from Facebook Page ID
        2. Create media container with image and caption
        3. Wait 1-2 seconds and check container status via `GET /{creation_id}?fields=status_code`
        4. Only publish when `status_code=FINISHED`
    - Handle authentication with System User access token
    - No extensive rate limiting needed (3 posts/week is well below Meta's quota)

6. **Error Handling**
    - If container creation fails (invalid image_url, expired token, etc.), log error and retry manually
    - Send email notification to support@bonchef.io on failure
    - Log error messages in database
    - No complex retry/backoff logic needed due to low posting volume

7. **Posting Success Tracking**
    - Store Instagram post ID after successful posting for future reference
    - Record `posted_at` timestamp when post is successfully published
    - Store Instagram post URL for easy access and debugging
    - Update `is_posted` flag to true upon successful completion

8. **Image Selection**
    - Use recipe's main image for Instagram posts
    - Ensure image is publicly accessible

## Non-Goals (Out of Scope)

- Admin UI for managing the queue (use Supabase UI instead)
- User-facing interface to view scheduled posts
- Analytics tracking within the app (use Instagram's built-in analytics)
- Support for other social media platforms
- Automatic recipe selection based on criteria
- Hashtag management (handled by AI prompt)

## Design Considerations

- No UI components needed for this feature
- Database table design should be simple and efficient
- Job should be lightweight to avoid API rate limiting

## Technical Considerations

- **API Endpoints Used:**
    - `GET /v23.0/{PAGE_ID}?fields=instagram_business_account`
    - `POST /v23.0/{IG_USER_ID}/media`
    - `POST /v23.0/{IG_USER_ID}/media_publish`
- **Required Permissions:** `instagram_basic`, `instagram_content_publish`, `pages_manage_posts`, `pages_read_engagement`
- **Authentication:** System User access token from Business Manager
- **Content Type:** multipart/form-data for POST requests
- **Image Requirements:** Must be publicly accessible URLs
- **Job Location:** New `/instagram-repost-job` folder (separate from existing notification services)

## Success Metrics

- Successful posting of recipes at scheduled times (3 times per week)
- Zero manual intervention required for posting
- Error rate < 5% (with proper retry mechanism)
- Consistent posting schedule maintained

## Open Questions

_No remaining open questions - all requirements have been clarified._

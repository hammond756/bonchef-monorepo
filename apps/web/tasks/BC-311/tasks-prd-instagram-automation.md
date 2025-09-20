# Task List: Instagram Post Automation

Based on PRD: `prd-instagram-automation.md`

## Relevant Files

- `supabase/migrations/[timestamp]_create_recipe_repost_queue.sql` - Database migration for the recipe repost queue table
- `instagram-repost-job/types.ts` - TypeScript types for Instagram repost functionality
- `instagram-repost-job/instagram-service.ts` - Core Instagram API integration service
- `instagram-repost-job/instagram-service.test.ts` - Unit tests for Instagram service
- `instagram-repost-job/caption-generator.ts` - AI caption generation service using Langfuse
- `instagram-repost-job/caption-generator.test.ts` - Unit tests for caption generator
- `instagram-repost-job/instagram-worker.ts` - Main worker that processes the queue and posts to Instagram
- `instagram-repost-job/instagram-worker.test.ts` - Unit tests for Instagram worker
- `instagram-repost-job/email-service.ts` - Email notification service for error handling
- `instagram-repost-job/email-service.test.ts` - Unit tests for email service
- `instagram-repost-job/README.md` - Documentation for the Instagram repost job system
- `src/lib/services/recipe-service.ts` - May need updates to support recipe data fetching for captions
- `src/lib/services/recipe-service.test.ts` - Unit tests for recipe service updates

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests or `npm test [specific-file]` for individual test files
- The Instagram repost job should be designed to run independently from the main application
- All environment variables for Instagram API should be documented in the README

## Tasks

- [x] 1.0 Database Schema Setup
    - [x] 1.1 Create Supabase migration for `recipe_repost_queue` table with all required columns
    - [x] 1.2 Add proper foreign key constraints and indexes for performance
    - [x] 1.3 Test migration in development environment
    - [x] 1.4 Update database types in TypeScript if needed

- [x] 2.0 Instagram API Service Implementation
    - [x] 2.1 Create `instagram-repost-job` folder structure
    - [x] 2.2 Implement Instagram API service with Meta Business Suite API v23.0
    - [x] 2.3 Add method to get Instagram Business ID from Facebook Page ID
    - [x] 2.4 Add method to create media container with image and caption
    - [x] 2.5 Add method to check container status before publishing
    - [x] 2.6 Add method to publish media container
    - [x] 2.7 Add proper error handling for API failures
    - [x] 2.8 Write comprehensive unit tests for all API methods

- [x] 3.0 AI Caption Generation Service
    - [x] 3.1 Create caption generator service using Langfuse integration
    - [x] 3.2 Implement prompt for generating Instagram captions with recipe data
    - [x] 3.3 Add character limit validation (2200 characters max)
    - [x] 3.4 Add logic to fetch recipe data (name, source_name, ingredients, instructions)
    - [x] 3.5 Implement caption truncation if it exceeds character limit
    - [x] 3.6 Write unit tests for caption generation and validation

- [x] 4.0 Instagram Repost Job Worker
    - [x] 4.1 Create main worker that processes the recipe repost queue
    - [x] 4.2 Add logic to fetch scheduled posts from database
    - [x] 4.3 Integrate Instagram API service and caption generator
    - [x] 4.4 Add image URL validation (ensure publicly accessible)
    - [x] 4.5 Implement posting success tracking (update database with post details)
    - [x] 4.6 Add proper logging for all operations
    - [x] 4.7 Write unit tests for the worker logic

- [x] 5.0 Error Handling & Notifications
    - [x] 5.1 Create email notification service for error reporting
    - [x] 5.2 Add error logging to database with detailed error messages
    - [x] 5.3 Implement retry logic for failed posts (simple retry, no complex backoff)
    - [x] 5.4 Add email notifications to support@bonchef.io on failures
    - [x] 5.5 Write unit tests for error handling scenarios

- [x] 6.0 Job Scheduling & Configuration
    - [x] 6.1 Set up job scheduling for CET timezone (Tuesday 12:30, Thursday 17:00, Saturday 10:00)
    - [x] 6.2 Add environment variable configuration for Instagram API credentials
    - [x] 6.3 Create configuration file for posting schedule and API settings
    - [x] 6.4 Add documentation for setting up and running the Instagram repost job
    - [x] 6.5 Test job execution in development environment
    - [x] 6.6 Add monitoring and health check capabilities

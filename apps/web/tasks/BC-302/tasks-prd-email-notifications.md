# Task List: Email Notifications for Recipe Comments

## Relevant Files

### Database & Migrations

- `supabase/migrations/[timestamp]_create_notification_tables.sql` - Database migration for notification tables and triggers
- `supabase/migrations/[timestamp]_add_notification_preferences_trigger.sql` - Migration for user preference initialization trigger

### Worker & Email System

- `src/lib/services/email-service.ts` - Core email sending functionality with SMTP configuration
- `src/lib/services/email-service.test.ts` - Unit tests for email service
- `src/lib/services/notification-worker.ts` - Background worker for processing notification queue
- `src/lib/services/notification-worker.test.ts` - Unit tests for notification worker
- `src/lib/templates/email-templates.ts` - HTML email templates with Bonchef branding
- `src/lib/templates/email-templates.test.ts` - Unit tests for email templates

### API Routes

- `src/app/api/unsubscribe/route.ts` - API route for handling unsubscribe requests
- `src/app/api/unsubscribe/route.test.ts` - Unit tests for unsubscribe route
- `src/app/unsubscribe/page.tsx` - Frontend page for unsubscribe confirmation
- `src/app/unsubscribe/page.test.tsx` - Unit tests for unsubscribe page

### Environment & Configuration

- `.env.example` - Updated environment variables for SMTP configuration
- `package.json` - Add nodemailer dependency for email sending

### Testing

- `src/tests/e2e/email-notifications.spec.ts` - End-to-end tests for email notification flow
- `src/tests/e2e/unsubscribe-flow.spec.ts` - End-to-end tests for unsubscribe functionality

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Database migrations should be created using `supabase migrations new [name]` command.
- The worker will run as a separate process on Heroku using Heroku Scheduler.

## Tasks

- [x] 1.0 Database Schema & Triggers
    - [x] 1.1 Create migration for `notifications_queue` table with UUID primary key, comment_id, recipe_id, recipient_id, created_at, and sent boolean fields
    - [x] 1.2 Create migration for `notification_preferences` table with user_id primary key, recipe_comment_notifications boolean, and updated_at timestamp
    - [x] 1.3 Create PostgreSQL trigger function `init_notification_preferences()` to automatically create preferences for new users
    - [x] 1.4 Create trigger `on_user_created` to call the preference initialization function
    - [x] 1.5 Create PostgreSQL trigger function `notify_recipe_owner()` to add notifications to queue when comments are created
    - [x] 1.6 Create trigger `on_comment_insert` to call the notification function (excluding self-comments)
    - [x] 1.7 Add proper foreign key constraints and indexes for performance
    - [x] 1.8 Test database triggers with sample data to ensure they work correctly

- [x] 2.0 Email Worker Infrastructure
    - [x] 2.1 Create `email-service.ts` with nodemailer configuration for Zoho SMTP
    - [x] 2.2 Add environment variables for SMTP configuration (ZOHO_USER, ZOHO_PASS)
    - [x] 2.3 Create `notification-worker.ts` with Supabase client initialization
    - [x] 2.4 Implement queue processing logic to fetch unsent notifications (limit 10 per batch)
    - [x] 2.5 Add user preference checking before sending emails
    - [x] 2.6 Implement batch processing logic for multiple comments within 3 minutes
    - [x] 2.7 Add error handling and logging for failed email deliveries
    - [x] 2.8 Create worker entry point script for Heroku deployment
    - [x] 2.9 Add nodemailer dependency to package.json

- [x] 3.0 Email Template & Sending System
    - [x] 3.1 Create `email-templates.ts` with HTML template for comment notifications
    - [x] 3.2 Implement Bonchef branding with logo, colors (#385940), and responsive design
    - [x] 3.3 Add comment content, author name, and recipe title to email template
    - [x] 3.4 Include recipe link and unsubscribe link in email template
    - [x] 3.5 Implement email sending function with proper error handling
    - [x] 3.6 Add PostHog tracking events for email delivery, opens, and clicks
    - [x] 3.7 Create email template testing with different comment scenarios
    - [x] 3.8 Implement email content sanitization to prevent XSS attacks

- [x] 4.0 Unsubscribe System
    - [x] 4.1 Create `/api/unsubscribe` route to handle unsubscribe requests with user_id and type parameters
    - [x] 4.2 Implement preference update logic to set `recipe_comment_notifications` to false
    - [x] 4.3 Create `/unsubscribe` page with confirmation message and return to app link
    - [x] 4.4 Add proper URL parameter validation and error handling
    - [x] 4.5 Implement PostHog tracking for unsubscribe events
    - [x] 4.6 Add security measures to prevent unauthorized unsubscribes
    - [x] 4.7 Test unsubscribe flow with valid and invalid parameters

- [x] 5.0 Testing & Monitoring
    - [x] 5.1 Create unit tests for email service with mocked SMTP
    - [ ] 5.2 Create unit tests for notification worker with mocked Supabase
    - [x] 5.3 Create unit tests for email templates with various input scenarios
    - [ ] 5.4 Create unit tests for unsubscribe API route
    - [ ] 5.5 Create end-to-end tests for complete notification flow
    - [ ] 5.6 Create end-to-end tests for unsubscribe functionality
    - [x] 5.7 Add PostHog event tracking for all key user interactions
    - [ ] 5.8 Implement monitoring for email delivery rates and error rates
    - [ ] 5.9 Create documentation for Heroku Scheduler setup
    - [ ] 5.10 Test the complete system in staging environment

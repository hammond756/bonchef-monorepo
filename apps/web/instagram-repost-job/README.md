# Instagram Repost Job

This service automates the posting of selected recipes to Instagram using the Meta Business Suite API.

## Overview

The Instagram repost job runs on a schedule to post recipes from the `recipe_repost_queue` table to Instagram. It includes:

- AI-generated captions using Langfuse
- Instagram API integration via Meta Business Suite
- Error handling and email notifications
- Success tracking and logging

## Environment Variables

Create a `.env` file in the `instagram-repost-job` directory with the following variables:

```env
# Instagram API Configuration
FACEBOOK_PAGE_ID=your_facebook_page_id
SYSTEM_USER_ACCESS_TOKEN=your_system_user_access_token
INSTAGRAM_API_VERSION=v23.0

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com

# Email Configuration (Zoho Mail)
ZOHO_USER=your_zoho_email@bonchef.io
ZOHO_PASS=your_zoho_app_password
SUPPORT_EMAIL=support@bonchef.io

# Job Configuration
POSTING_TIMEZONE=CET
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
```

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure environment variables (see above)

3. **Set up Zoho Mail (Zoho.eu):**
    - Use your existing Zoho Mail credentials for Zoho.eu
    - Make sure `ZOHO_USER` and `ZOHO_PASS` are set in your environment
    - The system will use Zoho.eu SMTP server (smtp.zoho.eu:587) to send error notifications and success reports

4. **Set up Langfuse prompt:**
    - Create a prompt named `InstagramCaption` in your Langfuse project
    - The prompt should accept these input variables:
        - `recipe_title`: The name of the recipe
        - `source_name`: The source/author of the recipe
        - `ingredients`: Formatted ingredients list
        - `instructions`: Formatted instructions list
    - Example prompt template:

        ```
        Create an engaging Instagram caption for this recipe:

        Recipe: {{recipe_title}}
        Source: {{source_name}}

        Ingredients:
        {{ingredients}}

        Instructions:
        {{instructions}}

        Requirements:
        - Write in Dutch
        - Make it engaging and appetizing
        - Include relevant hashtags (max 10)
        - Keep it under 2200 characters
        - Use emojis appropriately
        - Make it sound natural and social media friendly
        - Don't include the recipe instructions in full, just mention key steps
        - Focus on what makes this recipe special

        Format the response as a single Instagram caption ready to post.
        ```

5. **Test the setup (recommended first):**

    ```bash
    npm run test:run
    ```

    This will test the entire flow without actually posting to Instagram.

6. **Dry run with real data (recommended before production):**

    ```bash
    npm run dry-run
    ```

    This will process real posts from your database but show what would be posted without actually posting to Instagram.

7. Run the actual job:
    ```bash
    npm start
    ```

## Architecture

- `types.ts` - TypeScript type definitions
- `instagram-service.ts` - Instagram API integration
- `caption-generator.ts` - AI caption generation using Langfuse
- `instagram-worker.ts` - Main worker that processes the queue
- `email-service.ts` - Email notification service
- `config.ts` - Configuration management

## Posting Schedule

- Tuesday at 12:30 CET
- Thursday at 17:00 CET
- Saturday at 10:00 CET

## API Endpoints Used

- `GET /v23.0/{PAGE_ID}?fields=instagram_business_account` - Get Instagram Business ID
- `POST /v23.0/{IG_USER_ID}/media` - Create media container
- `GET /v23.0/{CREATION_ID}?fields=status_code` - Check container status
- `POST /v23.0/{IG_USER_ID}/media_publish` - Publish media container

## Error Handling

- Retry failed posts up to 3 times
- Send email notifications to support@bonchef.io on failure
- Log all errors to database
- No complex backoff logic (low volume: 3 posts/week)

## Testing

### Unit Tests

Run unit tests with:

```bash
npm test
```

### Integration Test (Mock Mode)

Test the entire flow without posting to Instagram:

```bash
npm run test:run
```

This will:

- ✅ Validate your configuration
- ✅ Test database connection
- ✅ Simulate Instagram posting (mock)
- ✅ Simulate caption generation (mock)
- ✅ Test email notifications (mock)
- ✅ Add a test post to the queue if none exist

### Manual Testing

1. Add a recipe to the `recipe_repost_queue` table in Supabase
2. Set `scheduled_date` to a time in the past
3. Set `is_posted` to `false`
4. Run the job: `npm start`

## Monitoring

The job logs all operations and updates the database with success/failure status. Check the `recipe_repost_queue` table for job status.

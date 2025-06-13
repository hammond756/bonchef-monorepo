# Post Conversations to Slack

This edge function posts recent conversations to a Slack channel. It is designed to be triggered hourly via a PostgreSQL scheduled function.

## Setup

1. Deploy the edge function:

    ```bash
    supabase functions deploy post-conversations-to-slack
    ```

2. Set the required secrets:

    ```bash
    supabase secrets set SLACK_TOKEN=xoxb-your-bot-token
    ```

3. The database migrations will:
    - Enable the required extensions (pg_net, pg_cron)
    - Create a scheduled function that runs hourly
    - Set up environment detection to prevent execution in local development

## Production Configuration

In production, you need to set the edge function key as a database parameter:

```sql
ALTER DATABASE postgres SET app.edge_function_key = 'your_service_role_key_here';
```

You can get your service role key from the Supabase dashboard under Project Settings > API.

## Local Development

The scheduled function will detect if it's running in a local/development environment and will skip triggering the edge function. This prevents unnecessary execution during development.

## Manual Trigger

You can manually trigger the function with:

```bash
curl -i --location --request POST 'https://lwnjybqifrnppmahxera.supabase.co/functions/v1/post-conversations-to-slack' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

## Schedule Customization

To change the schedule, update the cron expression in the migration file:

```sql
SELECT cron.schedule(
  'trigger-post-conversations-to-slack',
  '0 * * * *',  -- Change this expression (default: every hour)
  'SELECT trigger_post_conversations_to_slack()'
);
```

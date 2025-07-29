# Notification System Development Guide

Dit document legt uit hoe je het notification systeem lokaal en in productie test en draait.

## Setup

### Environment Variables

Maak een `.env.local` bestand aan in de root van je project met:

```bash
NEXT_PUBLIC_SUPABASE_URL=jouw-supabase-url
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
POSTMARK_API_KEY=jouw-postmark-api-key
POSTMARK_FROM_EMAIL=jouw-verified-sender-email
NODE_ENV=development
```

- Supabase keys vind je in je Supabase dashboard onder Settings > API.
- Postmark keys en verified sender vind je in je Postmark dashboard.

### Database Schema

De volgende tabellen moeten bestaan (zie migraties):

- `notification_queue` (pending notifications)
- `notification_preferences` (user preferences)
- `comments` (recipe comments)
- `recipes` (recepten)
- `profiles` (gebruikersprofielen)

## Development Workflow

1. **Database resetten** (laadt automatisch test data):

    ```bash
    supabase db reset
    ```

2. **Notifications verwerken:**

    ```bash
    npm run notify:dev
    ```

3. **Resultaten bekijken:**
    - Check je email inbox
    - Bekijk de console output
    - Check de database voor verwerkte notifications

## Database Queries

- Pending: `SELECT * FROM notification_queue WHERE sent = false;`
- Verwerkt: `SELECT * FROM notification_queue WHERE sent = true;`
- Preferences: `SELECT * FROM notification_preferences;`
- Recente comments:
    ```sql
    SELECT c.*, r.title as recipe_title, p.display_name as commenter_name
    FROM comments c
    JOIN recipes r ON c.recipe_id = r.id
    JOIN profiles p ON c.user_id = p.id
    ORDER BY c.created_at DESC
    LIMIT 10;
    ```

## Troubleshooting

- **Missing env:** Controleer je `.env.local` en herstart je terminal.
- **Database connectie:** Check Supabase URL/key en of Supabase draait.
- **Email faalt:** Controleer je Postmark API key, verified sender, logs en of je account is goedgekeurd.
- **Module type warning:** Opgelost door `"type": "module"` in package.json.

## Production Deployment (Heroku)

1. Voeg Heroku Scheduler toe:
    ```bash
    heroku addons:create scheduler:standard
    ```
2. Zet env vars:
    ```bash
    heroku config:set NEXT_PUBLIC_SUPABASE_URL="..."
    heroku config:set SUPABASE_SERVICE_ROLE_KEY="..."
    heroku config:set POSTMARK_API_KEY="..."
    heroku config:set POSTMARK_FROM_EMAIL="..."
    ```
3. Scheduler job: `npm run notify` (elke 10 min/uur)
4. Logs: `heroku logs --tail --source scheduler`

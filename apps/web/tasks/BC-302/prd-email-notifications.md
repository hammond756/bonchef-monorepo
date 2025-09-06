# Email Notifications for Recipe Comments

## Online Resources

- Jira Ticket: https://bonchef.atlassian.net/browse/BC-302

## Introduction/Overview

This feature will automatically send email notifications to recipe owners when someone comments on their recipes. The goal is to increase user engagement by keeping recipe creators informed about interactions with their content, while respecting user preferences and providing easy opt-out options.

## Goals

1. **Increase User Engagement**: Keep recipe creators informed about comments on their recipes
2. **Respect User Privacy**: Allow users to opt-out of email notifications
3. **Maintain Brand Consistency**: Use Bonchef branding in all email communications
4. **Scalable Architecture**: Build a system that can handle current load (max 20 emails/day) and scale for future growth
5. **Measurable Success**: Track email delivery, open rates, and click-through rates

## User Stories

1. **As a recipe creator**, I want to receive an email notification when someone comments on my recipe so that I can stay engaged with my community
2. **As a recipe creator**, I want to easily unsubscribe from comment notifications so that I can control my email preferences
3. **As a user**, I want to comment on recipes without triggering notifications to myself so that I don't receive unnecessary emails
4. **As a user**, I want to place multiple comments quickly without receiving multiple emails so that my inbox doesn't get flooded

## Functional Requirements

1. **Database Schema**: The system must create and maintain two new tables:
    - `notifications_queue`: Stores pending email notifications
    - `notification_preferences`: Stores user email preferences

2. **Automatic Trigger**: The system must automatically add notifications to the queue when a new comment is created on a recipe

3. **User Preference Check**: The system must check user notification preferences before sending emails

4. **Email Delivery**: The system must send HTML-formatted emails with:
    - Bonchef branding and logo
    - Comment content and author name
    - Recipe title and link
    - Unsubscribe link

5. **Batch Processing**: The system must batch multiple comments from the same user on the same recipe within 3 minutes into a single email

6. **Self-Comment Filtering**: The system must not send notifications when users comment on their own recipes

7. **Unsubscribe Functionality**: The system must provide a working unsubscribe link that updates user preferences

8. **Worker Process**: The system must include a background worker that processes the notification queue

## Non-Goals (Out of Scope)

1. **Real-time Delivery**: Emails do not need to be sent instantly; a delay of up to 10 minutes is acceptable
2. **In-App Notification Center**: This feature focuses only on email notifications, not in-app notifications
3. **Notification Preferences UI**: Users can only manage preferences via email unsubscribe links for now
4. **Other Interaction Types**: This feature only handles comment notifications, not likes, saves, or shares
5. **Email Templates for Other Features**: This feature only creates templates for comment notifications

## Design Considerations

- **Email Template**: Must use Bonchef branding with logo, consistent with existing brand guidelines
- **HTML Format**: Emails must be HTML-formatted with responsive design for mobile devices
- **Unsubscribe Link**: Must be prominently displayed and functional
- **Color Scheme**: Use Bonchef brand colors (#385940 for primary elements)
- **Typography**: Use sans-serif fonts for readability across email clients

## Technical Considerations

1. **Database Triggers**: Use PostgreSQL triggers to automatically add notifications to queue
2. **Supabase Integration**: Leverage existing Supabase infrastructure for database operations
3. **SMTP Configuration**: Use Zoho Mail SMTP for email delivery
4. **Heroku Worker**: Implement as a background worker process on Heroku
5. **Environment Variables**: Store SMTP credentials and Supabase keys in environment variables
6. **Error Handling**: Implement proper error handling for failed email deliveries
7. **PostHog Integration**: Add tracking events for email metrics

## Success Metrics

1. **Delivery Rate**: Track percentage of emails successfully delivered
2. **Open Rate**: Monitor how many recipients open the emails
3. **Click-Through Rate**: Measure clicks on recipe links within emails
4. **Unsubscribe Rate**: Track how many users opt out of notifications
5. **User Engagement**: Monitor if users return to the app after receiving notifications

## Open Questions

1. **Email Frequency Limits**: Should there be a maximum number of emails per user per day?
2. **Comment Content Length**: Should there be a character limit for comment content in emails?
3. **Future Expansion**: How should the system be designed to accommodate other notification types (likes, saves) in the future?
4. **Email Template A/B Testing**: Should we implement different email templates to test engagement?
5. **Internationalization**: Do we need to support multiple languages in email templates?

## Implementation Phases

### Phase 1: Database & Core Infrastructure

- Create database tables and triggers
- Set up SMTP configuration
- Implement basic worker process

### Phase 2: Email System

- Create email templates with Bonchef branding
- Implement email sending logic
- Add error handling and retry mechanisms

### Phase 3: Unsubscribe System

- Create unsubscribe route and functionality
- Implement preference management
- Add PostHog tracking

### Phase 4: Testing & Monitoring

- Implement comprehensive testing
- Add monitoring and alerting
- Deploy to production with gradual rollout

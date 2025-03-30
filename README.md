# Create Recipe

Create Recipe is a web application for managing and sharing recipes with authentication. The application allows users to create, view, edit, and manage their personal recipes, as well as access public recipes from the Bonchef collection.

## Project Overview

This is a Next.js application using the App Router pattern, with Supabase for authentication and database storage. The application is built with TypeScript, React, and uses Shadcn UI components with Tailwind CSS for styling.

### Key Features

- User authentication via Supabase
- Create and manage personal recipes
- View public recipes from the Bonchef collection
- Recipe visibility control (public/private)
- Recipe image generation
- Chat functionality for recipe assistance
- URL scraping to import recipes from external sites

### Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Testing**: Playwright for E2E testing
- **AI Integration**: OpenAI for chat and image generation

### Project Structure

- `/src/app`: Next.js App Router pages and API routes
- `/src/components`: Reusable React components
  - `/ui`: Shadcn UI components
  - `/layout`: Layout components (header, footer, etc.)
  - `/auth`: Authentication-related components
- `/src/lib`: Library code and utilities
- `/src/utils`: Utility functions
  - `/supabase`: Supabase client and utilities
- `/src/hooks`: Custom React hooks
- `/src/tests`: Test files

### Authentication and Authorization

The application uses Supabase for authentication. Middleware ensures that user sessions are properly managed. Recipe endpoints are authenticated and only return:
- Public recipes from the Bonchef collection
- The logged-in user's own recipes

### Database Schema

The database includes relationships between Users and Recipes, where:
- Each Recipe has an owner (User)
- Recipes can be public or private
- Only the owner can edit their own recipes

## Deployment

The application is configured for deployment on Heroku.

## Completed Features

[x] Update backend database to allow User->Recipe relationship
[x] When a recipe is created, set the authenticated user as its owner
[x] All recipe endpoints should require authentication and should only return bonchef recipes _or_ the logged in users own recipes
[x] Implement supabase authentication in create prototype
[x] Do authenticated fetch call to create recipe
[x] write tests for public/private recipe endpoints
[x] Create the homescreen with all the users own recipes
[x] When a recipe is created, go back to the homescreen
[x] When a recipe is opened from the homescreen, it should open as a static page
[x] Implement recipe teaser cards that fetch full recipe details when clicked

# TODO

[] Limiteer context die gebruikt wordt door agent tot N laatste messages
[x] Maak "Clear history" button nederlands en iets minder groot
[x] Update prompt(s) om teasers terug te geven ipv hele recepten
[] Test het op een of andere manier automatisch..

## Recipe Teaser Cards

The application now supports teaser messages in the chat interface, allowing users to:

1. Receive recipe suggestions as clickable cards
2. Click on a teaser card to view the full recipe details in a modal
3. Explore recipe options without cluttering the chat interface

### How Teaser Messages Work

Teaser messages are sent by the bot as messages with a specific type:

```typescript
{
    type: "bot",
    botMessage: {
       content: "...",  // Recipe name or short description
       type: "teaser"
    }
}
```

When a user clicks on a teaser card:
1. The application makes a streaming request to the `/api/generate-recipe` endpoint
2. The response is processed using the stream parser utilities
3. The full recipe details are displayed in a modal without leaving the chat interface

This provides a more interactive and user-friendly way to discover recipes during conversation.
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

### Seeding test data for Supabase

An easy way to create a seed.sql file for Supabase is to simple create objects locally and dump the database. See this GH comment: https://github.com/orgs/supabase/discussions/9251#discussioncomment-6481081

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

## Layout Strategy Developer Guide

This application implements a sophisticated, mobile-first layout strategy designed for optimal user experience across all device types. The layout system is built on several key principles:

### Architecture Principles

**1. Scroll-Aware Navigation**
- Navigation elements (top bar, tab bar) intelligently hide/show based on scroll direction
- Provides maximum content viewing area while maintaining easy access to navigation
- Uses `requestAnimationFrame` for smooth, performant animations

**2. Layout Composition**
- Two primary layout types: `BaseLayout` (top bar only) and `TabLayout` (top + tab bar)
- Layouts wrap page content and handle navigation positioning automatically
- Clean separation between layout logic and page content

**3. Mobile-First Design**
- Safe area handling for iOS devices (notches, home indicators)
- Fixed positioning with proper content spacing
- Touch-friendly interaction zones

**4. Route-Based Behavior**
- Tab navigation only appears on designated pages (`/ontdek`, `/collection`, `/import`)
- Other pages use simplified top-bar-only layout
- Automatic layout selection based on route structure

### Layout Components

**BaseLayout** (`src/components/layouts/base-layout.tsx`)
- For pages requiring only top navigation
- Used by: authentication pages, settings, individual content views
- Accepts `topBarContent` prop for custom header content

**TabLayout** (`src/components/layouts/tab-layout.tsx`)
- For main application pages with bottom navigation
- Inherits all BaseLayout functionality plus tab bar
- Accepts both `topBarContent` and `tabBarContent` props

### Core Components

**TopBar** (`src/components/layout/top-bar.tsx`)
- Fixed-position header with scroll-aware visibility
- Handles safe area insets automatically
- Provides spacer element to prevent content overlap

**TabBar** (`src/components/layout/tab-bar.tsx`)
- Fixed-position bottom navigation
- Route-aware visibility (only shows on tab pages)
- Floating action button integration

**useScrollDirection Hook** (`src/hooks/use-scroll-direction.ts`)
- Detects scroll direction with configurable threshold
- Optimized with `requestAnimationFrame` for performance
- Returns visibility state for navigation elements

### Implementation Guidelines

**Adding New Pages:**

1. **For content pages** (profiles, recipes, settings):
   ```tsx
   // app/your-page/layout.tsx
   import { BaseLayout } from '@/components/layouts/base-layout';
   
   export default function YourPageLayout({ children }) {
     return <BaseLayout>{children}</BaseLayout>;
   }
   ```

2. **For main navigation pages** (if adding to tab structure):
   ```tsx
   // app/your-tab-page/layout.tsx
   import { TabLayout } from '@/components/layouts/tab-layout';
   
   export default function YourTabPageLayout({ children }) {
     return <TabLayout>{children}</TabLayout>;
   }
   ```

**Customizing Navigation Content:**
```tsx
<BaseLayout 
  topBarContent={
    <div className="flex items-center justify-between w-full">
      <BackButton />
      <h1>Custom Title</h1>
      <SettingsButton />
    </div>
  }
>
  {children}
</BaseLayout>
```

### CSS Utilities

The layout system includes mobile-friendly CSS utilities in `globals.css`:

- **Safe Area Utilities**: `.safe-area-top`, `.safe-area-bottom`, etc.
- **Scroll Behavior**: Smooth scrolling with iOS bounce prevention
- **Input Handling**: Prevents zoom on mobile form inputs
- **Viewport Fixes**: iOS Safari address bar behavior handling

### Performance Considerations

- Scroll detection uses `requestAnimationFrame` for 60fps performance
- Threshold-based scroll detection prevents excessive state updates
- Fixed positioning minimizes layout shifts
- Safe area calculations use CSS environment variables for efficiency

### Extending the System

When adding new layout requirements:

1. **Assess if existing layouts meet needs** - Most pages fit BaseLayout or TabLayout
2. **Create specialized layouts sparingly** - Prefer composition over proliferation
3. **Maintain scroll-aware patterns** - Use `useScrollDirection` for consistent behavior
4. **Test across devices** - Verify safe area handling on various screen sizes

This layout strategy ensures consistent user experience while providing flexibility for different page types and future expansion.

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
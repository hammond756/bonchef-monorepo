# PRD: Bonchef Onboarding Flow for Anonymous Users

### 0. Online Resources

- **Jira Ticket**: [https://bonchef.atlassian.net/browse/BC-255](https://bonchef.atlassian.net/browse/BC-255)

### 1. Introduction/Overview

This document outlines the requirements for a new onboarding flow targeted at non-authenticated (anonymous) users of Bonchef. The goal is to provide a gentle, context-aware introduction to the app's core functionality. Instead of an immediate, intrusive popup, the onboarding will be triggered by specific user interactions, guiding them to add their first recipe and encouraging them to create an account. This feature also involves a significant technical change in how draft recipes are handled for anonymous users, moving to a persistent `onboarding_session_id`.

### 2. Goals

- Increase user activation by guiding new users to add their first recipe.
- Improve the initial user experience by replacing an immediate overlay with contextual, trigger-based onboarding.
- Create a smoother pathway from recipe creation to user registration.
- Implement a more robust system for associating anonymous users with their created recipes before signup.

### 3. User Stories

- **As a new, unauthenticated user,** I want to explore the app without being forced into an onboarding flow immediately, so that I can get a feel for the platform first.
- **As a new, unauthenticated user,** when I show intent to add a recipe, I want to be guided through the process, so I understand what Bonchef offers.
- **As a new, unauthenticated user,** after adding my first recipe, I want a clear call-to-action to save my recipe by creating an account, so I don't lose my work.

### 4. Functional Requirements

#### 4.1 Onboarding Triggers

The onboarding overlay should be triggered under the following conditions for an anonymous user:

1.  When the user clicks the primary "add recipe" button (the '+' icon).
2.  Once, after the user has been on the site for 2 minutes.
3.  Once, the first time a user visits the collection page.
4.  When a user lands on a shared recipe page and then clicks the back button to navigate to the discover page.

- A long-lifespan cookie should be used to ensure that time-based and one-time triggers are not shown repeatedly to the same user.

#### 4.2 Onboarding UI - Overlay

- The onboarding flow appears in an overlay that slides in from the bottom, covering about 95% of the screen height.
- The top of the overlay should have rounded corners and a small visual divider.
- The header bar contains:
    - **Title:** "Onboarding"
    - **Close Button (X):** Top-right, closes the overlay.
    - **Back Arrow (←):** Top-left, appears from screen 2 onwards.
    - **Progress Bar:** A grey bar that fills with green to show progress, appears from screen 2 onwards.

#### 4.3 Onboarding Screen Flow

**Screen 1: Welcome Screen**

- **Title:** "Welkom bij Bonchef"
- **Subtitle:** "Je nieuwe sociale kookboek"
- **Primary CTA:** A large button with the text "Laat me zien wat Bonchef doet! 👀". Clicking this proceeds to Screen 2.
- **Secondary CTA:** A link with the text "Later misschien". Clicking this closes the overlay.

**Screen 2: Introduction to Bonchef**

- **Progress Bar:** Filled to 1/3.
- **Title:** "Ontdek Bonchef"
- **Content:** Three USP blocks with icons:
    1.  **Jouw digitale kookboek:** "Al je recepten op één plek. Van oma’s geheimen tot Instagram hits."
    2.  **Koken is samen leuker:** "Deel recepten, laat reacties achter en inspireer elkaar."
    3.  **Van moeten naar willen:** "Motivatie door uitdagingen, beloningen en inspiratie." (With a "Binnenkort beschikbaar" badge).
- **Primary CTA:** A button with the text "Start met mijn eerste recept! 🚀". Clicking this proceeds to Screen 3.

**Screen 3: Add Your First Recipe**

- **Progress Bar:** Filled to 2/3.
- **Title:** "Voeg je eerste recept toe"
- **Subtitle:** "Kies de manier die het beste bij je past om te beginnen met je verzameling"
- **Input Options:** The screen will integrate the new non-blocking import components:
    1.  **📷 Foto van kookboek:** "Maak een foto van je favoriete recept". Clicking this opens the full-screen `PhotoImportView`.
    2.  **🔗 Van website:** "Plak een link van je favoriete site". Clicking this opens the `URLImportPopup`.
    3.  **✍️ Zelf typen:** "Schrijf je eigen recept op". Clicking this opens the `TextImportPopup`.
- **Secondary CTA:** A link with the text "Later misschien - maak eerst een account aan". Clicking this navigates the user directly to the `/signup` page.
- Upon successful start of an import job using one of the options, the user proceeds to Screen 4.

**Screen 4: Success Screen**

- **Progress Bar:** Filled to 3/3.
- **Visual:** A large trophy icon with a star.
- **Title:** "Fantastisch! 🎉"
- **Subtitle:** "Je eerste recept staat in je collectie!"
- **Primary CTA:** A button with the text "Bekijk en controleer je recept". Clicking this navigates the user to the `/signup` page, prompting them to create an account to save and view their recipe.

### 5. Non-Goals (Out of Scope)

- The success screen (Screen 4) will **not** include the secondary CTAs "Voeg nog een recept toe" or "Nodig vrienden uit". The focus is on channeling the user towards account creation.
- Recipes created during the onboarding flow by users who never sign up will not be automatically cleaned up or deleted.

### 6. Technical Considerations

- **Anonymous Recipe Management:**
    - The current `claim_recipe_id` cookie mechanism is insufficient for an asynchronous import flow and will not be used for this feature.
    - A new `onboarding_session_id` (UUID) will be generated and stored in a long-lifespan cookie for anonymous users.
    - A new relational table, `onboarding_session_recipes`, will be created to link `onboarding_session_id` to `recipe_id`.
    - The background import jobs (`recipe_import_jobs`) created will be linked to the `onboarding_session_id`.
    - The new `startBackgroundRecipeImport` server action will accept this `onboarding_session_id` and use it to create the association in the new table after the recipe is created.
    - When a user signs up, the system must check for the `onboarding_session_id` cookie. If present, all recipes _and_ recipe import jobs linked to that session ID must be transferred to the new user's `user_id`, and the cookie should be cleared.
- **Analytics:**
    - To allow for flexible funnel analysis, a single structured PostHog event will be used to track user progress.
    - **Event Name:** `onboarding_step_completed`
    - **Properties:**
        - `step_index`: (Number) The 0-indexed number of the step the user just completed.
        - `total_steps`: (Number) The total number of steps in the flow (currently 4).
    - This event should be fired when the user completes a screen by clicking its primary call-to-action:
        - **After completing Screen 1 (Welcome):** Fire event with `step_index: 0`.
        - **After completing Screen 2 (Introduction):** Fire event with `step_index: 1`.
        - **After completing Screen 3 (Recipe Added):** Fire event with `step_index: 2`.
        - **After completing Screen 4 (Success):** Fire event with `step_index: 3`.

### 7. Success Metrics

- **Primary Metric:** Conversion rate of new anonymous users who start the onboarding flow to successfully creating a recipe.
- **Secondary Metric:** Conversion rate of users who complete the onboarding flow to creating an account.
- **Funnel Analysis:** Track the completion rate of each step by analyzing the `onboarding_step_completed` event in PostHog. The `step_index` and `total_steps` properties will allow for building a robust funnel to identify user drop-off points.

### 8. Open Questions

- None at this time.

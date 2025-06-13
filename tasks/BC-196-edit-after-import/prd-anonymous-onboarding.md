# PRD: Anonymous User Onboarding & Recipe Creation

- **Feature:** Anonymous Onboarding Flow
- **Ticket:** BC-196

---

## 1. Overview

This document outlines the user flow for new, anonymous (not logged-in) users to create their first recipe. The primary goal is to allow users to experience the core value of the application—effortlessly creating a beautiful, shareable recipe—before requiring them to sign up. This should reduce friction in the user journey and increase the likelihood of user activation and conversion.

Recipes created by anonymous users will be temporarily assigned to a generic "marketing user" account.

## 2. User Flow

1.  **Welcome Page:** A new, anonymous user starts on the `/welcome` page.
2.  **First Recipe Creation:** The user is guided from `/welcome` to the `/first-recipe` page, which provides the interface for creating a recipe (e.g., by importing from a URL).
3.  **Draft Creation:** When the user imports a recipe, the system creates a new recipe with a `DRAFT` status. This recipe is owned by the "marketing user."
4.  **Edit and Refine:** The user is immediately redirected to the standard recipe editing page (`/edit/[recipeId]`), where they can modify all fields, ingredients, and instructions, identical to the flow for logged-in users (as implemented in BC-196).
5.  **Publish:** Upon saving the changes on the edit page, the recipe's status is updated to `PUBLISHED`.
6.  **View Recipe:** The user is redirected to the public page for their newly published recipe (`/recipe/[recipeId]`).
7.  **Call to Action:** The recipe page will display a pre-existing Call to Action (CTA) prompting the user to sign up to save their recipe and access other features.

## 3. Functional Requirements

| ID    | Requirement                                                                                                                              |
| :---- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **FR1** | **Restrict Onboarding Access:** Logged-in users must be redirected away from the `/welcome` and `/first-recipe` pages to the main application dashboard or homepage. |
| **FR2** | **Anonymous Draft Creation:** The import/creation logic on the `/first-recipe` page must create a `DRAFT` recipe assigned to the designated "marketing user" if no user is authenticated. |
| **FR3** | **Post-Creation Redirect:** After successful draft creation, the anonymous user must be redirected to the `/edit/[recipeId]` page.       |
| **FR4** | **Post-Publish Redirect:** After the user saves (publishes) the recipe from the edit page, they must be redirected to the `/recipe/[recipeId]` page. |

## 4. Out of Scope

-   **Recipe Claiming:** The mechanism for a new user to sign up and claim recipes associated with their session is considered an existing, separate feature.
-   **CTA Implementation:** The sign-up CTA on the public recipe page is pre-existing.
-   **UI of Onboarding Pages:** The visual design and content of the `/welcome` and `/first-recipe` pages are not covered by this PRD.

## 5. Technical Considerations

-   **Marketing User ID:** A consistent method for identifying the "marketing user" is required. An environment variable (`MARKETING_USER_ID`) is the recommended approach.
-   **Server Actions:** Existing server actions for recipe creation will need to be adapted to handle requests from unauthenticated users by assigning ownership to the marketing user.
-   **Routing/Middleware:** Logic must be implemented (e.g., in middleware or on the specific pages) to enforce the access restrictions outlined in **FR1**. 
# PRD: Store Blog Name on Recipe Import

### 0. Online Resources

- **Jira Ticket:** [BC-59](https://bonchef.atlassian.net/browse/BC-59)

### 1. Introduction/Overview

This document outlines the requirements for a feature to store and display the name of the blog or website from which a recipe is imported via URL. The primary goal is to give proper credit to the original content creators and allow users to easily navigate back to the source.

### 2. Goals

- To accurately attribute all imported recipes to their original source.
- To enhance user trust and transparency by clearly indicating the origin of the content.
- To improve the user experience by providing a direct link back to the original recipe page.

### 3. User Stories

- As a user, when I import a recipe from a blog, I want to see the name of the blog so I can easily identify the source.
- As a user, I want to be able to click on the source name within the recipe's detail view to visit the original webpage for more context or other recipes.
- As a content curator, I want to ensure that all imported recipes automatically credit the original author or publication to maintain ethical standards.

### 4. Functional Requirements

1.  When a user imports a recipe from a URL, the system must attempt to extract the blog's name from the page content.
2.  The extracted name shall be stored in the `source_name` field of the recipe record.
3.  The original URL from which the recipe was imported will continue to be stored in the `source_url` field.
4.  If a descriptive name cannot be extracted from the page content, the system must use the hostname and top-level domain from the URL as a fallback (e.g., `recipetineats.com`).
5.  In the recipe detail view, the `source_name` must be displayed as a clickable link.
6.  Clicking the source name link must navigate the user to the `source_url` in a new tab.
7.  The source name and link must NOT be displayed if the `source_name` is "BonChef" or the `source_url` is "https://app.bonchef.io".

### 5. Non-Goals (Out of Scope)

- This feature will not involve fetching or displaying the source's favicon or logo.
- The source name will not be displayed on recipe summary cards, lists, or any view other than the full recipe detail page.
- There will be no advanced parsing or multiple attempts to find the "best" name; the defined extraction and fallback mechanism is sufficient.
- The source link should be conditionally rendered and should not appear at all if the source is the default placeholder.

### 6. Design Considerations

- The source name should be displayed clearly in the recipe detail view, positioned logically near other metadata like the recipe title or author.
- The link should be styled according to the application's existing design system for hyperlinks to ensure it is visibly interactive.

### 7. Technical Considerations

- The `scrapeRecipe` function located in `src/actions/recipe-imports.ts` is the primary entry point for this logic and will need to be modified.
- The underlying LLM call (`formatRecipe`) should be updated to request the blog's title or publication name as part of its structured output.
- The existing `source_name` and `source_url` fields in the recipe data model should be used. No database schema changes are anticipated.
- A simple utility function should handle the fallback logic of parsing the hostname from the `source_url`. The native `URL` API (`new URL(url).hostname`) is recommended for this.

### 8. Success Metrics

- 100% of recipes imported via URL have a non-empty `source_name` and `source_url` field populated in the database.
- A manual review of 20-30 imported recipes shows that the source names are accurate and the links are functional.

## Relevant Files

- `src/app/profiles/[slug]/page.tsx` - The main profile page that will be redesigned.
- `src/components/recipe/recipe-card.tsx` - A new reusable component for displaying a single recipe card, as seen in the mockup.
- `src/components/ui/share-button.tsx` - A new client component to handle the native web share functionality.
- `src/components/profile/profile-header.tsx` - A new component to encapsulate the redesigned profile header section.
- `src/components/ui/tabs.tsx` - Will use the existing Shadcn UI Tabs component to create the single-tab navigation.

### Notes

- Unit tests are not required for this implementation task but will be added in a future story.
- Focus on creating clean, reusable components with clear props.
- The implementation should be mobile-first.

## Tasks

- [x] 1.0 Create the reusable `RecipeCard` component
    - [x] 1.1 Create the file `src/components/recipe/recipe-card.tsx`.
    - [x] 1.2 Define the component's props interface, which should accept a `recipe` object.
    - [x] 1.3 Implement the card layout using a `div` with the recipe's image as a background. Apply `rounded-lg` and `overflow-hidden`.
    - [x] 1.4 Add a dark gradient overlay at the bottom of the card to ensure the recipe title is readable.
    - [x] 1.5 Position the recipe title at the bottom of the card.
    - [x] 1.6 Add the `LikeButton` component to the top-right corner of the card, ensuring it receives the necessary props and is functional.
    - [x] 1.7 Wrap the entire card in a Next.js `<Link>` component that navigates to the recipe's detail page.
- [x] 2.0 Redesign the profile page header
    - [x] 2.1 Create a new component file `src/components/profile/profile-header.tsx`.
    - [x] 2.2 Move the relevant header logic from `src/app/profiles/[slug]/page.tsx` to the new component.
    - [x] 2.3 Update the layout to match the mockup: circular `ProfileImage`, `display_name` (`text-3xl font-bold`), `bio`, and recipe/like counts.
    - [x] 2.4 Create a new client component `src/components/ui/share-button.tsx` that uses the Web Share API (`navigator.share`).
    - [x] 2.5 Integrate the `ShareButton` and the existing `EditProfileDialog` into the header, positioned correctly.
- [x] 3.0 Implement the single-tab navigation UI
    - [x] 3.1 In the `ProfilePage` component, use the Shadcn `Tabs`, `TabsList`, and `TabsTrigger` components.
    - [x] 3.2 Configure it with a single, static tab titled "Recepten".
    - [x] 3.3 Add a `TabsContent` area below the trigger which will contain the recipe grid.
- [x] 4.0 Integrate new components and structure on the profile page
    - [x] 4.1 In `src/app/profiles/[slug]/page.tsx`, import and use the new `ProfileHeader` component.
    - [x] 4.2 Replace the old `RecipeGrid` implementation with a grid that maps over the recipes and renders the new `RecipeCard` component for each one.
    - [x] 4.3 Ensure the overall page structure (container, spacing) aligns with the mockup.
- [x] 5.0 Final review, responsiveness checks, and cleanup
    - [x] 5.1 Thoroughly test the redesigned page on desktop, tablet, and mobile viewports.
    - [x] 5.2 Adjust Tailwind CSS classes as needed to ensure a fully responsive experience.
    - [x] 5.3 Remove any obsolete styles or components that are no longer used after the redesign.
    - [x] 5.4 Verify that all interactive elements (Like button, Share button, Edit profile) work correctly.

# Tasks: Dishcovery - Recipe Reconstruction via Photo and Description

## Relevant Files

- `src/components/import/import-overlay.tsx` - Main overlay component that needs to be updated to replace Chat with Dishcovery button
- `src/components/import/import-overlay.test.tsx` - Unit tests for the import overlay component
- `src/components/dishcovery/dishcovery-camera.tsx` - New camera component for photo capture
- `src/components/dishcovery/dishcovery-camera.test.tsx` - Unit tests for the camera component
- `src/components/dishcovery/dishcovery-description.tsx` - New description screen with voice/text input
- `src/components/dishcovery/dishcovery-description.test.tsx` - Unit tests for the description screen
- `src/components/dishcovery/dishcovery-layout.tsx` - Layout wrapper for the dishcovery flow
- `src/components/dishcovery/dishcovery-layout.test.tsx` - Unit tests for the layout component
- `src/hooks/use-dishcovery.ts` - Hook for managing dishcovery state and input
- `src/hooks/use-dishcovery.test.ts` - Unit tests for the dishcovery hook

- `src/app/dishcovery/page.tsx` - Main dishcovery page route
- `src/app/dishcovery/layout.tsx` - Layout for dishcovery pages
- `src/app/dishcovery/actions.ts` - Server actions for dishcovery operations
- `src/app/dishcovery/actions.test.ts` - Unit tests for dishcovery actions
- `src/actions/recipe-imports.ts` - Existing recipe imports actions that need to be updated to handle dishcovery source_type
- `src/lib/services/recipe-imports-job/client.ts` - Client service for recipe import jobs
- `src/lib/services/recipe-imports-job/shared.ts` - Shared logic for recipe import jobs
- `src/lib/services/recipe-imports-job/shared.test.ts` - Unit tests for recipe import job logic
- `supabase/migrations/[timestamp]_add_dishcovery_source_type.sql` - Database migration to add dishcovery as new source_type

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The existing recipe-imports-job service should be extended to handle the new dishcovery job type.
- Database migration is required to add 'dishcovery' as a new source_type in the recipe_import_jobs table.
- The existing \_processJobInBackground function in recipe-imports.ts needs to be updated to handle the new dishcovery source_type.
- Dishcovery will reuse the existing startRecipeImportJob() function instead of creating a separate service layer.

## Tasks

- [x] 1.0 Navigation Update - Replace Chat button with Dishcovery button
    - [x] 1.1 Update import-overlay.tsx to replace Chat button with Dishcovery button using scan.svg icon
    - [x] 1.2 Update button styling to match existing design system
    - [x] 1.3 Update tests to reflect the new button functionality
    - [x] 1.4 Verify button size matches former Chat button dimensions

- [x] 2.0 Camera Integration - Implement photo capture functionality
    - [x] 2.1 Create dishcovery-camera.tsx component reusing existing Scan camera components
    - [x] 2.2 Implement single photo capture functionality (no multiple photos)
    - [x] 2.3 Add gallery selection option for existing photos
    - [x] 2.4 Implement back button functionality to return to camera
    - [x] 2.5 Add proper camera permissions handling
    - [x] 2.6 Create unit tests for camera component
    - [x] 2.7 Integrate camera component into dishcovery layout

- [x] 3.0 Description Screen - Create voice/text input interface
    - [x] 3.1 Create dishcovery-description.tsx component with 1:1 photo display
    - [x] 3.2 Implement title "Tell more about this dish" and subtext
    - [x] 3.3 Create microphone module with animated waves (green/gray states)
    - [x] 3.4 Implement voice input with pause/restart functionality
    - [x] 3.5 Add text input field with 5-line limit and internal scrolling
    - [x] 3.6 Implement switching between voice and text modes
    - [x] 3.7 Add proper button labels and placeholders in English
    - [x] 3.8 Ensure text field stays above keyboard without UI scrolling
    - [x] 3.9 Create unit tests for description screen component

- [x] 4.0 Input Processing - Handle voice and text input validation
    - [x] 4.1 Create use-dishcovery.ts hook for state management
    - [x] 4.2 Implement input validation logic (photo + voice/text required)
    - [x] 4.3 Add voice input detection (not just silence)
    - [x] 4.4 Implement CTA button state management (active/inactive)
    - [x] 4.5 Add ok-hand.svg icon to CTA button
    - [x] 4.6 Create input validation tests
    - [x] 4.7 Implement proper error handling for invalid inputs

- [ ] 5.0 Recipe Generation Job - Create background job processing
    - [x] 5.1 Create database migration to add 'dishcovery' as new source_type in recipe_import_jobs table
    - [x] 5.2 Update recipe-imports.ts to handle 'dishcovery' source_type in \_processJobInBackground function
    - [x] 5.3 Extend recipe-imports-job service to handle dishcovery job type
    - [x] 5.4 Update dishcovery component to call existing startRecipeImportJob() function
    - [x] 5.5 Implement job creation when "Bonchef!" button is clicked
    - [x] 5.6 Integrate with existing prompt generate recipe function
    - [x] 5.7 Ensure recipe is saved as DRAFT in collection
    - [x] 5.8 Add proper error handling for job creation failures
    - [x] 5.9 Create unit tests for the updated recipe-imports.ts functionality
    - [x] 5.10 Verify background processing doesn't block UI

- [ ] 6.0 UI/UX Polish - Final styling and user experience refinements
    - [x] 6.1 Apply Bonchef design system tokens from globals.css
    - [x] 6.2 Ensure responsive design with mobile-first approach
    - [x] 6.3 Add proper loading states and transitions
    - [x] 6.4 Implement accessibility features (ARIA labels, keyboard navigation)
    - [x] 6.5 Add proper error messages and user feedback
    - [x] 6.6 Test touch interactions and mobile experience
- [x] 6.7 Verify design consistency with existing app components
- [x] 6.8 Add proper TypeScript types and interfaces
- [x] 6.9 Create integration tests for complete dishcovery flow

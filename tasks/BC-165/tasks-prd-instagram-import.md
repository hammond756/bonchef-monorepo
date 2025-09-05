## Relevant Files

- `src/lib/services/apify-service.ts` - New service to interact with the Apify platform, including an initial method for the Instagram scraper actor.
- `src/lib/services/apify-service.test.ts` - Unit tests for the Apify service.
- `src/lib/services/transcription-service.ts` - New service to handle video transcription by downloading an MP4 and sending it to the OpenAI API.
- `src/lib/services/transcription-service.test.ts` - Unit tests for the transcription service.
- `src/actions/recipe-imports.ts` - Main server action to orchestrate the import process. Will be modified to handle the new `vertical_video` source type.
- `src/lib/services/recipe-imports-job/shared.ts` - Contains the shared types for recipe import jobs; will be updated with the new source type.
- `src/components/import/url-import-popup.tsx` - The UI component for pasting URLs. Will be modified to detect Instagram links and trigger the correct import type.
- `src/tests/e2e/instagram-import.spec.ts` - New E2E test to validate the entire Instagram import flow from the user's perspective.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npm test -- [optional/path/to/test/file]` to run tests.

## Tasks

- [x] 1.0 **New Service: Apify Integration**
    - [x] 1.1 Create `src/lib/services/apify-service.ts`.
    - [x] 1.2 Implement a method `scrapeInstagramReel` that takes a Reel URL, calls the Apify actor (`shu8hvrXbJbY3Eb9W`) using `apify-client`, and returns the video URL, post caption, and author's handle.
    - [x] 1.3 Ensure API keys are loaded securely from environment variables.
    - [x] 1.4 Add basic unit tests for this service.

- [x] 2.0 **New Service: Video Transcription**
    - [x] 2.1 Create `src/lib/services/transcription-service.ts`.
    - [x] 2.2 Implement a method that takes a video URL (`linkToMp4`) as input.
    - [x] 2.3 The method should download the MP4 file to a temporary buffer or stream.
    - [x] 2.4 Send the downloaded video file to the OpenAI Speech-to-Text API (`gpt-4o-transcribe`).
    - [x] 2.5 Ensure the method cleans up any temporary resources.
    - [x] 2.6 Return the transcribed text as a string.
    - [x] 2.7 Add basic unit tests for this service.

- [x] 3.0 **Update Recipe Import Job System**
    - [x] 3.1 In `src/lib/types.ts`, add `vertical_video` to the `RecipeImportSourceTypeEnum` Zod schema.
    - [x] 3.2 Create a new Supabase migration to add the `vertical_video` value to the `recipe_import_source_type` enum in the database.
    - [x] 3.3 In `src/actions/recipe-imports.ts`, create a new handler function `handleVerticalVideoImport` that will contain the logic for this new flow.
    - [x] 3.4 Update the main switch/case in `processRecipeImport` (or equivalent function) in `recipe-imports.ts` to call `handleVerticalVideoImport` when the job source is `vertical_video`.

- [x] 4.0 **Implement Core Instagram Import Logic**
    - [ ] 4.1 Inside `handleVerticalVideoImport`, orchestrate the import process:
        - [x] 4.1.1 Call the `ApifyService.scrapeInstagramReel` to get reel data.
        - [x] 4.1.2 Call the `TranscriptionService` with the video URL to get the recipe text.
        - [x] 4.1.3 Combine the transcription and the post caption.
        - [x] 4.1.4 Call the existing `RecipeGenerationService` to convert the combined text into a recipe draft.
        - [x] 4.1.5 Save the new recipe, making sure to populate `source_name` with the Instagram handle and `source_url` with the reel link.
        - [x] 4.1.6 Update the recipe import job status to `completed` and link the new `recipe_id`.
    - [x] 4.2 Implement robust error handling. On any failure (scraping, transcription, generation), update the job status to `failed` and store a descriptive error message.

- [x] 5.0 **Update UI to Route Instagram URLs**
    - [x] 5.1 In `src/components/import/url-import-popup.tsx` (or the relevant import component), modify the URL submission logic.
    - [x] 5.2 Add a check to see if the submitted URL is from `instagram.com/reel/`.
    - [x] 5.3 If it is an Instagram Reel, call the `createRecipeImportJob` action with the `source` set to `vertical_video`. Otherwise, use the default `url` source.

- [ ] 6.0 **End-to-End Testing**
    - [ ] 6.1 Create a new Playwright test file `src/tests/e2e/instagram-import.spec.ts`.
    - [ ] 6.2 Write a test that opens the import modal, pastes a valid Instagram Reel link, and verifies that a pending recipe appears in the collection

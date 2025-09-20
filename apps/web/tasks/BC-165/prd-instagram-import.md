# BC-165 – Instagram Reel Recipe Import

## 0. Online Resources

- Jira: https://bonchef.atlassian.net/browse/BC-165
- Apify Instagram Scraper Actor: `shu8hvrXbJbY3Eb9W`
- FFmpeg docs: https://www.npmjs.com/package/fluent-ffmpeg
- OpenAI Speech-to-Text: https://platform.openai.com/docs/guides/speech-to-text

---

## 1. Introduction / Overview

Bonchef already lets users import a recipe from any web page by pasting a URL.  
This feature extends that flow to **Instagram Reels**. A user pastes a Reel link, we scrape it, transcribe the audio, and run the transcription (plus caption text) through our existing _Recipe Generation Service_ to create a recipe draft.  
This helps users collect and follow recipes they discover on Instagram without manually transcribing them.

## 2. Goals

1. Users can create a recipe draft from a public Instagram Reel URL with ≤ 3 clicks.
2. 95 % of valid Reel links convert to a draft in ≤ 60 seconds.
3. Graceful errors for unsupported URLs, private reels, or transcription failures.
4. Capture the original poster’s Instagram handle as `recipe.source`.

## 3. User Stories

1. **As an Instagram user**, I want to save a recipe I found in a reel so that I can follow the instructions later without returning to Instagram.
2. **As a new Bonchef visitor**, I want to import a reel during onboarding so that I immediately see the value of Bonchef.
3. **As an existing Bonchef member**, I want the reel import to feel identical to the current URL-import flow so that I don’t need to learn a new UI.

## 4. Functional Requirements

1. The system **must** validate that the pasted URL is an Instagram Reel (`https://www.instagram.com/reel/...`).
2. If the URL is not a reel, the UI **must** show: _"Only Reels are supported right now"_.
3. For valid reels, the backend **must**
    1. Call the Apify Instagram Scraper Actor (`shu8hvrXbJbY3Eb9W`) with the reel URL.
    2. Download the resulting MP4 video.
    3. Convert the video to MP3 using FFmpeg.
    4. Send the MP3 to OpenAI Speech-to-Text (`gpt-4o-transcribe`).
    5. Combine transcription + reel caption → call `RecipeGenerationService.generateFromText()` (reuse current service).
    6. Persist the returned recipe draft in Supabase tied to the current user.
    7. Store the Instagram handle as `recipe.source_name`, and the reel link as `recipe.source_url` (e.g., `@humansofny`).
4. The UI **must** reuse the existing URL-import component: paste field, progress indicator, success screen, error states.
5. When submitted, a recipe-import-job is created to show progress, whilst a fire-and-forget process is triggered for the actual work
6. If something goes wrong during the scrape process (network, private reel, transcription error), mark the recipe import job as failed.
7. The system **must** accept reels in any language; transcription is language-agnostic.
8. Intermediate artefacts (MP4, MP3) **must not** be stored after processing is complete.

## 5. Non-Goals (Out of Scope)

- Importing Instagram photo posts, carousels, or Stories.
- Parsing ingredient lists from on-screen text (OCR).
- Detecting languages or translating recipes.
- Storing raw video/audio files long-term.

## 6. Design Considerations (Optional)

- The same import popover is used as for any other URL (url-import-popup.tsx)
- Error messages follow the brand tone: clear and polite.
- Loading indicator uses the design-system `Spinner` component.

## 7. Technical Considerations (Optional)

- Use `apify-client` (`npm install apify-client`).
- FFmpeg is already available in the build image; leverage `fluent-ffmpeg` wrapper.
- Leverage existing `RecipeGenerationService` to avoid duplicating prompt logic.
- Ensure Apify and OpenAI API keys are loaded from `process.env` and **never** committed.
- Jobs should run in a Supabase background function or server action to avoid front-end timeouts.

## 8. Success Metrics

- ≥ 95 % of valid reel imports succeed.
- < 60 s average time from submission to draft ready.
- < 2 % of users abandon the flow due to errors.
- At least 100 reel imports per week within 1 month of release.

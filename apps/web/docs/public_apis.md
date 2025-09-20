# Transcription & Teaser API Documentation

## Transcription Endpoint

- **URL**: `/api/public/transcribe`
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Response**: Transcribed text in Dutch

```javascript
async function transcribeAudio(audioFile) {
    const formData = new FormData()
    formData.append("file", audioFile)

    const response = await fetch("/api/public/transcribe", {
        method: "POST",
        body: formData,
    })

    const { text } = await response.json()
    return text
}
```

## Teaser Endpoint

- **URL**: `/api/public/teaser`
- **Method**: POST
- **Content-Type**: `application/json`
- **Body**:

```typescript
interface TeaserRequest {
    text: string
    image?: string // base64 encoded image
}
```

- **Response**: AI-generated teaser text

```javascript
async function generateTeaser(text, imageBase64) {
    const response = await fetch("/api/public/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text,
            image,
        }),
    })

    const { teaser } = await response.json()
    return teaser
}

// Example with image
async function transcribeAndTeaser(audioFile, imageFile) {
    // Convert image to base64
    const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(imageFile)
    })

    const transcription = await transcribeAudio(audioFile)
    const teaser = await generateTeaser(transcription, imageBase64)
    return { transcription, teaser }
}
```

## Recipe Generation Endpoint

- **URL**: `/api/public/generate-recipe`
- **Method**: POST
- **Content-Type**: `application/json`
- **Body**:

```typescript
interface GenerateRecipeRequest {
    text: string
    image?: string // Optional base64 encoded image
}
```

- **Response**: Server-Sent Events (SSE) stream of the generated recipe

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source"

async function generateRecipe(text: string, imageBase64?: string) {
    await fetchEventSource("/api/public/generate-recipe", {
        method: "POST",
        body: JSON.stringify({
            text,
            image: imageBase64,
        }),
        headers: {
            "Content-Type": "application/json",
        },
        onmessage: (event) => {
            const recipe = JSON.parse(event.data)
            // Handle the recipe data as it streams in
            console.log(recipe)
        },
        onclose: () => {
            // Handle stream closure
            console.log("Stream closed")
        },
        onerror: (error) => {
            // Handle any errors
            console.error("Error:", error)
        },
    })
}

// Example usage with both text and image
async function generateRecipeWithImage(text: string, imageFile: File) {
    // Convert image to base64
    const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(imageFile)
    })

    await generateRecipe(text, imageBase64 as string)
}
```

The endpoint uses Server-Sent Events (SSE) to stream the generated recipe data in real-time. Each event contains a JSON object with the recipe information. The stream will automatically close when the recipe generation is complete.

Note: Make sure to install the `@microsoft/fetch-event-source` package for handling SSE:

```bash
npm install @microsoft/fetch-event-source
# or
yarn add @microsoft/fetch-event-source
```

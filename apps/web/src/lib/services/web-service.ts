import Langfuse from "langfuse"
import CallbackHandler from "langfuse-langchain"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { GeneratedRecipe, GeneratedRecipeSchema } from "../types"
import { parse } from "node-html-parser"
import { unitTranslations } from "@/lib/translations"
import { MessageContent } from "@langchain/core/messages"

// Enhanced fetch function to bypass bot detection
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    ]

    const acceptLanguages = [
        "en-US,en;q=0.9,nl;q=0.8",
        "en-US,en;q=0.9",
        "nl-NL,nl;q=0.9,en;q=0.8",
        "en-GB,en;q=0.9,en-US;q=0.8",
    ]

    // Try different strategies
    const strategies = [
        { name: "direct", useProxy: false },
        { name: "proxy", useProxy: true },
    ]

    for (const strategy of strategies) {
        console.log(`[fetchWithRetry] Trying strategy: ${strategy.name}`)
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Add random delay between attempts to avoid rate limiting
                if (attempt > 0) {
                    const delay = Math.random() * 2000 + 1000 // 1-3 seconds
                    console.log(`[fetchWithRetry] Waiting ${Math.round(delay)}ms before retry ${attempt + 1}`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                }

                const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
                const randomAcceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)]

                const headers: HeadersInit = {
                    "User-Agent": randomUserAgent,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Language": randomAcceptLanguage,
                    "Accept-Encoding": "gzip, deflate, br",
                    "DNT": "1",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                }

                // Add referer for some requests to look more natural
                if (Math.random() > 0.5) {
                    headers["Referer"] = "https://www.google.com/"
                }

                // Add additional headers for proxy strategy
                if (strategy.useProxy) {
                    headers["X-Forwarded-For"] = generateRandomIP()
                    headers["X-Real-IP"] = generateRandomIP()
                    headers["CF-Connecting-IP"] = generateRandomIP()
                }

                console.log(`[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries} with User-Agent: ${randomUserAgent.substring(0, 50)}...`)

                let fetchUrl = url
                const fetchOptions: RequestInit = {
                    cache: "no-store",
                    headers,
                    signal: AbortSignal.timeout(30000), // 30 second timeout
                }

                // Use proxy if strategy requires it
                if (strategy.useProxy && process.env.PROXY_URL) {
                    fetchUrl = `${process.env.PROXY_URL}?url=${encodeURIComponent(url)}`
                    // Remove some headers that might conflict with proxy
                    delete headers["Accept-Encoding"]
                }

                const response = await fetch(fetchUrl, fetchOptions)

                // Check if we got a bot detection page
                const text = await response.text()
                if (text.includes("Just a moment") || 
                    text.includes("Checking your browser") || 
                    text.includes("Cloudflare") ||
                    text.includes("cf-chl-opt") ||
                    text.includes("challenge-platform")) {
                    console.warn(`[fetchWithRetry] Bot detection detected on attempt ${attempt + 1} with strategy ${strategy.name}`)
                    if (attempt === maxRetries - 1) {
                        continue // Try next strategy
                    }
                    continue
                }

                // If we got here, the response looks good
                console.log(`[fetchWithRetry] Success on attempt ${attempt + 1} with strategy ${strategy.name}`)
                return new Response(text, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                })

            } catch (error) {
                console.error(`[fetchWithRetry] Attempt ${attempt + 1} failed with strategy ${strategy.name}:`, error)
                if (attempt === maxRetries - 1) {
                    continue // Try next strategy
                }
            }
        }
    }

    throw new Error("All fetch attempts failed with all strategies")
}

// Helper function to generate random IP addresses for proxy headers
function generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

export type GeneratedRecipeWithSourceAndThumbnail = GeneratedRecipe & {
    source_name: string
    source_url: string
    thumbnail: string | null
}

export type RecipeGenerationMetadata = {
    containsFood: boolean
    enoughContext: boolean
}

function translateRecipeUnits<T extends GeneratedRecipe>(recipe: T): T {
    return {
        ...recipe,
        ingredients: recipe.ingredients.map((group) => ({
            ...group,
            ingredients: group.ingredients.map((ingredient) => {
                const lowerCaseUnit = ingredient.unit.toLowerCase()
                const translatedUnit = unitTranslations[lowerCaseUnit]
                return {
                    ...ingredient,
                    unit: translatedUnit || ingredient.unit,
                }
            }),
        })),
    }
}

export async function recipeFromSocialMediaVideo(
    textInput: string,
    imageUrl: string
): Promise<{
    recipe: GeneratedRecipe
    metadata: RecipeGenerationMetadata
}> {
    const langfuse = new Langfuse()
    const promptClient = await langfuse.getPrompt("SocialMediaVideoImport", undefined, {
        type: "text",
    })

    const content: {
        role: "system" | "user"
        content: MessageContent
    }[] = [
        {
            role: "system",
            content: await promptClient.compile(),
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: textInput,
                },
            ],
        },
    ]

    if (imageUrl) {
        content.push({
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: { url: imageUrl, detail: "high" },
                },
            ],
        })
    }

    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4.1",
        temperature: 0.1,
        maxTokens: 4096,
    }).withStructuredOutput(
        z.object({
            recipe: GeneratedRecipeSchema,
            metadata: z.object({
                containsFood: z.boolean(),
                enoughContext: z.boolean(),
            }),
        }),
        {
            name: "response",
        }
    )

    const response = await model.invoke(content, {
        callbacks: [new CallbackHandler()],
    })

    return {
        recipe: translateRecipeUnits(response.recipe),
        metadata: response.metadata,
    }
}

export async function formatRecipe(
    text: string,
    promptName: string = "ExtractRecipeFromWebcontent"
): Promise<{
    recipe: GeneratedRecipeWithSourceAndThumbnail
    metadata: RecipeGenerationMetadata
}> {
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4.1",
        temperature: 0.1,
        maxTokens: 4096,
    }).withStructuredOutput(
        z.object({
            recipe: GeneratedRecipeSchema.extend({
                source_name: z.string(),
                source_url: z.string(),
                thumbnail: z
                    .string()
                    .nullable()
                    .describe(
                        "The URL of the main image for the recipe. This should be the most appealing and representative image available on the page. MUST be null if no image URL is found."
                    ),
            }),
            metadata: z.object({
                containsFood: z
                    .boolean()
                    .describe("Whether the content contains food or recipe-related information"),
                enoughContext: z
                    .boolean()
                    .describe("Whether there is enough context to generate a good recipe"),
            }),
        })
    )

    const langfuse = new Langfuse()
    const promptClient = await langfuse.getPrompt(promptName, undefined, {
        type: "chat",
    })
    const prompt = promptClient.compile({ input: text })

    try {
        const { recipe, metadata } = await model.invoke(prompt, {
            callbacks: [new CallbackHandler()],
        })
        const translatedRecipe = translateRecipeUnits(recipe)
        return {
            recipe: translatedRecipe,
            metadata,
        }
    } catch (error: unknown) {
        // const errorMessage = error?.message || error?.response?.data?.error?.message || "";

        // if (errorMessage.includes("maximum context length")) {
        //   console.warn("Context length exceeded, returning original content...");
        //   return text
        // }

        throw error
    }
}

export async function formatDishcoveryRecipe(text: string): Promise<{
    recipe: GeneratedRecipeWithSourceAndThumbnail
    metadata: RecipeGenerationMetadata
}> {
    return formatRecipe(text, "DishcoveryRecipeGenerator")
}

export async function getRecipeContent(url: string): Promise<{
    textForLLM: string
    bestImageUrl: string | null
}> {
    try {
        console.log(`[getRecipeContent] Fetching URL: ${url}`)
        const response = await fetchWithRetry(url)

        if (!response.ok) {
            console.error(`[getRecipeContent] Failed to fetch URL: ${await response.text()}`)
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
        }

        const html = await response.text()
        const root = parse(html)

        console.log("[getRecipeContent] Evaluating page for LD+JSON data...")
        const ldJsonScripts = root.querySelectorAll('script[type="application/ld+json"]')
        const ldJsonData = ldJsonScripts
            .map((script) => {
                try {
                    return JSON.parse(script.textContent)
                } catch (e) {
                    console.warn("Failed to parse LD+JSON, skipping.", e)
                    return null
                }
            })
            .filter((d) => d)

        let mostCompleteSchema: Record<string, unknown> | null = null
        let maxFound = 0

        for (const schema of ldJsonData) {
            const graph = (schema["@graph"] as Record<string, unknown>[]) || [
                schema as Record<string, unknown>,
            ]
            for (const item of graph) {
                const itemType = item["@type"] as string | string[]
                const isRecipe =
                    (typeof itemType === "string" && itemType.includes("Recipe")) ||
                    (Array.isArray(itemType) && itemType.includes("Recipe"))

                if (isRecipe) {
                    let foundCount = 0
                    if (item.recipeIngredient) foundCount++
                    if (item.recipeInstructions) foundCount++
                    if (item.name) foundCount++

                    if (foundCount > maxFound) {
                        maxFound = foundCount
                        mostCompleteSchema = item
                    }
                }
            }
        }

        let bestImageUrl: string | null = null
        const allSchemaImages: string[] = []

        // First, try to get the image from the most complete schema
        if (mostCompleteSchema) {
            const image = mostCompleteSchema.image as
                | string
                | { url: string }
                | (string | { url: string })[]
            const imageUrl = Array.isArray(image)
                ? typeof image[0] === "object"
                    ? image[0]?.url
                    : image[0]
                : typeof image === "object"
                  ? image.url
                  : image
            if (imageUrl) {
                bestImageUrl = imageUrl
            }
        }

        // If no image from the best schema, check all schemas
        if (!bestImageUrl) {
            for (const schema of ldJsonData) {
                const graph = (schema["@graph"] as Record<string, unknown>[]) || [
                    schema as Record<string, unknown>,
                ]
                for (const item of graph) {
                    if (item.image) {
                        const image = item.image as
                            | string
                            | { url: string }
                            | (string | { url: string })[]
                        const imageUrl = Array.isArray(image)
                            ? typeof image[0] === "object"
                                ? image[0]?.url
                                : image[0]
                            : typeof image === "object"
                              ? image.url
                              : image
                        if (imageUrl) {
                            allSchemaImages.push(imageUrl)
                        }
                    }
                }
            }
            if (allSchemaImages.length > 0) {
                bestImageUrl = allSchemaImages[0] // Fallback to the first image found
            }
        }

        // If still no image, try to find a prominent image on the page
        if (!bestImageUrl) {
            const ogImage = root.querySelector('meta[property="og:image"]')
            if (ogImage) {
                bestImageUrl = ogImage.getAttribute("content") || null
            }
        }

        if (maxFound > 1 && mostCompleteSchema) {
            console.log("[getRecipeContent] Using structured data for LLM.")
            const textForLLM = JSON.stringify(mostCompleteSchema)
            return { textForLLM, bestImageUrl }
        }

        console.log(
            "[getRecipeContent] No complete structured data found. Falling back to DOM content extraction."
        )

        // Fallback to extracting text content
        const selectors = [
            "article",
            "main",
            "[role='main']",
            "#main",
            ".main",
            "#content",
            ".content",
        ]
        let mainContentElement = selectors
            .map((selector) => root.querySelector(selector))
            .find((el) => el)

        if (!mainContentElement) {
            mainContentElement = root
        }

        mainContentElement
            .querySelectorAll("script, style, nav, header, footer, aside, form, a, button")
            .forEach((el) => el.remove())

        const textContent = mainContentElement.innerText
        const cleanedText = textContent
            .split(/\n+/)
            .map((line) => line.trim())
            .filter((line) => line.length > 10) // Filter out very short/irrelevant lines
            .filter((line, index, self) => self.indexOf(line) === index) // Deduplicate
            .join("\n")

        return { textForLLM: cleanedText, bestImageUrl }
    } catch (error) {
        console.error("[getRecipeContent] An error occurred:", error)
        throw new Error(`Failed to process URL ${url}. Reason: ${(error as Error).message}`)
    }
}

/**
 * Normalizes a URL by ensuring it has a scheme.
 * @param url The URL to normalize.
 * @returns The normalized URL.
 */
export function normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`
    }
    return url
}

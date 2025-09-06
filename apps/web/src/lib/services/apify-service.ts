import { ApifyClient } from "apify-client"

interface ApifyTikTokResponse {
    text: string
    authorMeta: {
        nickName: string
    }
    musicMeta: {
        playUrl: string
        musicOriginal: boolean
    }
    videoMeta: {
        coverUrl: string
        downloadAddr: string
    }
}

interface ApifyInstagramResponse {
    type: string
    videoUrl: string
    caption: string
    ownerUsername: string
    displayUrl: string
    error?: string
    errorDescription?: string
}

export interface ScrapeResult {
    videoUrl: string
    caption: string
    author: string
    thumbnailUrl: string
}

type ServiceResponse<T> = Promise<
    | {
          success: false
          error: string
      }
    | {
          success: true
          data: T
      }
>

/**
 * A service for interacting with the Apify platform.
 * It provides methods to call Apify actors and process their results.
 */
export class ApifyService {
    private client: ApifyClient
    private actorMemoryRequest: number = parseInt(process.env.APIFY_ACTOR_MEMORY_REQUEST || "1024")

    /**
     * Creates an instance of ApifyService.
     * @param {Readonly<{ apiToken: string }>} options - The options containing the Apify API token.
     */
    constructor({ apiToken }: Readonly<{ apiToken: string }>) {
        this.client = new ApifyClient({
            token: apiToken,
        })
    }

    /**
     * Scrapes an Instagram Reel for recipe information.
     * @param {string} reelUrl - The URL of the Instagram Reel to scrape.
     * @returns {ServiceResponse<InstagramScrapeResult>} The result of the scrape operation.
     */
    async scrapeInstagramReel(reelUrl: string): ServiceResponse<ScrapeResult> {
        try {
            const input = {
                directUrls: [reelUrl],
                resultsType: "posts",
                resultsLimit: 1,
                searchType: "hashtag",
                searchLimit: 1,
                addParentData: false,
            }

            const run = await this.client.actor("shu8hvrXbJbY3Eb9W").call(input, {
                memory: this.actorMemoryRequest,
            })
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems()

            if (!items || items.length === 0) {
                return { success: false, error: "No items found in the result." }
            }

            const post = items[0] as unknown as ApifyInstagramResponse

            if (post.error) {
                console.error("Error scraping Instagram reel:", post.errorDescription)

                if (post.error === "restricted_page") {
                    return {
                        success: false,
                        error: "Deze instagram account staat ons niet toe om de video content op te halen.",
                    }
                }

                return {
                    success: false,
                    error: "Er ging iets mis bij het ophalen van de instagram content. Helaas is het niet duidelijk wat de oorzaak is.",
                }
            }

            if (post.type !== "Video") {
                return {
                    success: false,
                    error: "Het lijkt er op dat de link die je gebruikt hebt geen reel is.",
                }
            }

            const data: ScrapeResult = {
                videoUrl: post.videoUrl,
                caption: post.caption,
                author: post.ownerUsername,
                thumbnailUrl: post.displayUrl,
            }

            return { success: true, data }
        } catch (error) {
            console.error("Error scraping Instagram reel:", error)
            return {
                success: false,
                error: "Er ging iets mis bij het ophalen van de instagram content. Helaas is het niet duidelijk wat de oorzaak is.",
            }
        }
    }

    async scrapeTikTok(videoUrl: string): ServiceResponse<ScrapeResult> {
        try {
            const input = {
                excludePinnedPosts: false,
                postURLs: [videoUrl],
                proxyCountryCode: "None",
                resultsPerPage: 100,
                scrapeRelatedVideos: false,
                shouldDownloadAvatars: false,
                shouldDownloadCovers: false,
                shouldDownloadMusicCovers: false,
                shouldDownloadSlideshowImages: false,
                shouldDownloadSubtitles: false,
                shouldDownloadVideos: true,
                profileScrapeSections: ["videos"],
                profileSorting: "latest",
                searchSection: "",
                maxProfilesPerQuery: 10,
            }

            const run = await this.client.actor("GdWCkxBtKWOsKjdch").call(input, {
                memory: this.actorMemoryRequest,
            })
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems()

            if (!items || items.length === 0) {
                return { success: false, error: "We konden geen content vinden voor deze link" }
            }

            const { error, errorDescription } = items[0]

            if (error) {
                return { success: false, error: errorDescription as string }
            }

            const post = items[0] as unknown as ApifyTikTokResponse

            const data: ScrapeResult = {
                videoUrl: post.videoMeta.downloadAddr as string,
                caption: post.text as string,
                author: post.authorMeta.nickName as string,
                thumbnailUrl: post.videoMeta.coverUrl as string,
            }

            return { success: true, data }
        } catch (error) {
            console.error("Error scraping TikTok:", error)
            return {
                success: false,
                error: "Er ging iets mis bij het ophalen van de TikTok content. Het is helaas niet duidelijk wat de oorzaak is.",
            }
        }
    }
}

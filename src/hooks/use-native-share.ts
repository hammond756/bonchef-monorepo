import { useToast } from "@/hooks/use-toast"

interface ShareData {
    title: string
    text: string
    url: string
}

interface UseNativeShareOptions {
    onSuccess?: () => void
    onError?: (error: Error) => void
}

/**
 * Hook that provides native share functionality with clipboard fallback
 * @param shareData - The data to share (should include full URL)
 * @param options - Optional callbacks for success and error handling
 * @returns A function that triggers the share action and returns the method used
 */
export function useNativeShare(shareData: ShareData, options: UseNativeShareOptions = {}) {
    const { toast } = useToast()

    const handleShare = async (): Promise<"native" | "clipboard" | null> => {
        if (navigator.share) {
            try {
                await navigator.share(shareData)
                options.onSuccess?.()
                return "native"
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Share error:", error)
                    toast({
                        title: "Er is iets misgegaan",
                        description: "Kon de inhoud niet delen.",
                        variant: "destructive",
                    })
                    options.onError?.(error as Error)
                }
                return null
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url)
                toast({
                    title: "Gekopieerd!",
                    description: "De link is naar je klembord gekopieerd.",
                })
                options.onSuccess?.()
                return "clipboard"
            } catch (error) {
                toast({
                    title: "Er is iets misgegaan",
                    description: "Kon de link niet naar je klembord kopiëren.",
                    variant: "destructive",
                })
                options.onError?.(error as Error)
                return null
            }
        }
    }

    return handleShare
}

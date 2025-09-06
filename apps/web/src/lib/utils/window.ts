export const getOrigin = (): string => {
    if (typeof window !== "undefined") {
        return window.location.origin
    }

    // Basically there to suppress an error in the dev server
    return "https://x"
}

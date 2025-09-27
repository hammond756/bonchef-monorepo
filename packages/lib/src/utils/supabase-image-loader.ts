export default function supabaseImageLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    
    // If the image is not a supabase image, return the original image
    if (!src.includes("/storage/v1/object/")) {
        return src
    }

    // Get the path of the image
    const path = src.split("/public/").pop()

    // If the path is not a public image, return the original image
    if (!path) {
        return src
    }

    // Extract the host (with http or https) from the src path
    const hostFromSrc = src.match(/^https?:\/\/[^/]+/)
    const host = hostFromSrc ? hostFromSrc[0] : ""

    const url = `${host}/storage/v1/render/image/public/${path}?width=${width}&resize=contain&quality=${quality || 75}`

    return url
}
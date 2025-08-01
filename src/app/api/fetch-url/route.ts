import { NextResponse } from "next/server"
import { getRecipeContent, normalizeUrl } from "@/lib/services/web-service"
import { validateUrlForImport } from "@/lib/services/url-validation-service"

export async function POST(request: Request) {
    const { url } = await request.json()

    // Validate URL before processing
    const validationResult = validateUrlForImport(url)
    if (!validationResult.isValid) {
        return NextResponse.json(
            { error: validationResult.errorMessage || "Deze URL wordt niet ondersteund." },
            { status: 400 }
        )
    }

    if (
        process.env.NODE_ENV !== "production" &&
        process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true"
    ) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return NextResponse.json({ content: "This is a fake response" })
    }

    const normalizedUrl = normalizeUrl(url)
    const recipeContent = await getRecipeContent(normalizedUrl)

    return NextResponse.json({ content: recipeContent })
}

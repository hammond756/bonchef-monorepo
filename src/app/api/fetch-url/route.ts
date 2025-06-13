import { NextResponse } from "next/server"
import { getRecipeContent } from "@/lib/services/web-service"

export async function POST(request: Request) {
    const { url } = await request.json()

    if (
        process.env.NODE_ENV !== "production" &&
        process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true"
    ) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return NextResponse.json({ content: "This is a fake response" })
    }

    const recipeContent = await getRecipeContent(url)

    return NextResponse.json({ content: recipeContent })
}

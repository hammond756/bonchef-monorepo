import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    const response = await fetch(`https://r.jina.ai/${url}`)
    const text = await response.text()

    console.log("text", text)
    
    // Here you might want to add HTML parsing/cleaning logic
    // to extract meaningful content from the webpage
    
    return NextResponse.json({ content: text })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    )
  }
} 
import { NextResponse } from "next/server"
import OpenAI from "openai";

const shortenPageText = async (text: string): Promise<string> => {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes recipe content from web pages. Keep all ingredient amounts and important recipe steps. Remove unnecessary text like ads, comments, and personal stories."
        },
        {
          role: "user", 
          content: `Summarize this recipe content, keeping all ingredients and instructions intact: ${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });

    return response.choices[0].message.content || text;
  } catch (error: any) {
      // const errorMessage = error?.message || error?.response?.data?.error?.message || "";
    
      // if (errorMessage.includes("maximum context length")) {
      //   console.warn("Context length exceeded, returning original content...");
      //   return text
      // }
    
      throw error;
    }
    
}

export async function POST(request: Request) {

  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true") {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return NextResponse.json({ content: "This is a fake response" })
  }

  let webContent = ""
  try {
    const { url } = await request.json()
    
    const response = await fetch(`https://r.jina.ai/${url}`)
    webContent = await response.text()
  } catch (error) {
    console.error("Failed to fetch URL content", error)
    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    )
  }
  
  const essentialInfo = await shortenPageText(webContent)

  return NextResponse.json({ content: essentialInfo })
} 
import { NextResponse } from "next/server"
import OpenAI from "openai";

const shortenPageText = async (text: string) => {

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo-1106",
  messages: [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "Extract the essential information from a markdown page of a recipe. Focus on the recipe ingredients, instructions and tips for variations. Respond in a simple markdown format:\n\n```\nTitle: <Recipe Title>\n\nIngredients\n\nGroup 1\n* ...\n* ...\n\nGroup 2\n* ...\n\nInstructions:\n* ...\n* ...\n\nTips, tricks and variations:\n* ...\n* ...\n* ...\n```"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": text
        }
      ]
    }
  ],
  response_format: {
    "type": "text"
  },
  temperature: 0.2,
  max_completion_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
});
}
export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    const response = await fetch(`https://r.jina.ai/${url}`)
    const text = await response.text()

    const essentialInfo = await shortenPageText(text)
    
    return NextResponse.json({ content: essentialInfo })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    )
  }
} 
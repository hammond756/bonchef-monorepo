import Langfuse from "langfuse";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const langfuse = new Langfuse()

export async function POST(request: NextRequest) {
    const { text, image } = await request.json();

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });


    const prompt = await langfuse.getPrompt("DishcoveryTeaser", undefined, { type: "text" })
    const promptText = await prompt.compile()


    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: promptText,
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: text,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: image,
                        },
                    },
                ],
            },
        ],
    });

    const textResponse = response.choices[0].message.content

    return NextResponse.json({
        teaser: textResponse,
    });
}
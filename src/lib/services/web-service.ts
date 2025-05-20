import Langfuse from "langfuse";
import CallbackHandler from "langfuse-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { GeneratedRecipe, GeneratedRecipeSchema } from "../types";


const getEssentialRecipeInfo = async (text: string): Promise<{ recipe: GeneratedRecipe, thumbnailUrl: string }> => {

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4.1-mini",
    temperature: 0.7,
    maxTokens: 4096,
  }).withStructuredOutput(z.object({
    recipe: GeneratedRecipeSchema,
    thumbnailUrl: z.string()
  }))

  const langfuse = new Langfuse()
  const promptClient = await langfuse.getPrompt("ExtractRecipeFromWebcontent", undefined, { type: "chat" })
  const prompt = promptClient.compile({ input: text })

  try {
    return await model.invoke(prompt, { callbacks: [new CallbackHandler()] })
  } catch (error: any) {
    // const errorMessage = error?.message || error?.response?.data?.error?.message || "";

    // if (errorMessage.includes("maximum context length")) {
    //   console.warn("Context length exceeded, returning original content...");
    //   return text
    // }

    throw error;
  }

}

export async function getRecipeContent(url: string) {
  let webContent = ""

  try {
    const response = await fetch(
      `https://r.jina.ai/${url}`,
      {
        headers: {
          // 'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
          'X-Engine': 'direct',
          'X-Remove-Selector': 'header, footer, nav, aside, iframe, .comment, .subscribe',
          'X-Return-Format': 'markdown',
          // 'X-Retain-Images': 'none',
          'X-With-Images-Summary': 'true'
        }
      }
    )
    webContent = await response.text()
  } catch (error) {
    console.error("Failed to fetch URL content", error)
    throw error
  }

  return getEssentialRecipeInfo(webContent)
}

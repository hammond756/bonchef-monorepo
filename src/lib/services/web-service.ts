import Langfuse from "langfuse";
import CallbackHandler from "langfuse-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { GeneratedRecipe, GeneratedRecipeSchema } from "../types";
import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';
import { Recipe as SchemaOrgRecipe } from "schema-dts";


export async function formatRecipe(text: string): Promise<{ recipe: GeneratedRecipe, thumbnailUrl: string }> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4.1-nano",
    temperature: 0.1,
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
  let recipeData = ""

  const webContent = await JSDOM.fromURL(url)
  const defuddledResult = await Defuddle(webContent)
  const recipeSchemaOrgData: SchemaOrgRecipe[] = defuddledResult.schemaOrgData.filter((item: {"@type": string}) => item["@type"] === "Recipe")

  if (!recipeSchemaOrgData.length) {
    console.warn(`No recipe schema org data found on site: ${url}, using defuddled content`)
    recipeData = defuddledResult.content
  } else {
    recipeData = JSON.stringify(recipeSchemaOrgData)
  }

  return recipeData
}

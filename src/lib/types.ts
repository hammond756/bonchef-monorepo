import { z } from "zod";

export const unitEnum = z.enum([
  "gram",
  "kilogram",
  "milligram",
  "milliliter",
  "liter",
  "teaspoon",
  "tablespoon",
  "slice",
  "whole",
  "clove",
  "bunch",
  "centimeter",
  "pinch",
  "dash",
  "handful",
  "can",
  "jar",
  "pack",
  "sheet",
  "sprig",
  "scoop",
  "none",
  "cup",
]);

export const unitAbbreviations = {
  "gram": "g",
  "kilogram": "kg",
  "milligram": "mg",
  "milliliter": "ml",
  "liter": "l",
  "teaspoon": "tsp",
  "tablespoon": "tbsp",
  "slice": "slice",
  "whole": "whole",
  "clove": "clove",
  "bunch": "bunch",
  "centimeter": "cm",
  "pinch": "pinch",
  "dash": "dash",
  "handful": "handful",
  "can": "can",
  "jar": "jar",
  "pack": "pack",
  "sheet": "sheet",
  "sprig": "sprig",
  "scoop": "scoop",
  "none": "none",
  "cup": "cup",
};

export const IngredientSchema = z.object({
  quantity: z.optional(
    z.object({
      type: z.literal("range"),
      low: z.number(),
      high: z.number(),
    })
  ),
  unit: z.optional(unitEnum),
  description: z.string(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipeSchema = z.object({
  title: z.string(),
  n_portions: z.number(),
  total_cook_time_minutes: z.number(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      ingredients: z.array(IngredientSchema),
    }),
  ),
  instructions: z.array(z.string()),
  thumbnail: z.string(), 
  source_url: z.string(),
  source_name: z.string(),
});

export const GeneratedRecipeSchema = z.object({
  title: z.string(),
  n_portions: z.number(),
  total_cook_time_minutes: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      ingredients: z.array(IngredientSchema),
    }),
  ),
  instructions: z.array(z.string()),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;

export type Unit = z.infer<typeof unitEnum>; 

export interface UserInput {
  message: string;
  webContent: Array<{ url: string; content: string }>;
}

export const MessageTypeSchema = z.enum([
  "text",
  "recipe",
  "teaser",
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ResponseMessage = z.object({
  content: z.string(),
  type: MessageTypeSchema,
});

export const LLMResponseSchema = z.object({
  messages: z.array(ResponseMessage)
});

export const IntentResponseSchema = z.object({
  intent: z.enum(["recipe", "modify", "question", "other", "teaser", "introduction"]),
})

export type LLMResponse = z.infer<typeof LLMResponseSchema>;
export type IntentResponse = z.infer<typeof IntentResponseSchema>;

export type Message = z.infer<typeof ResponseMessage>;
export type AgentResponse = Message[];

export interface BaseMessage {
  type: "user" | "bot" | "bot_error" | "bot_loading";
  id: string | null;
}

export interface UserMessageType extends BaseMessage {
  type: "user";
  userInput: UserInput;
}

export interface BotMessageType extends BaseMessage {
  type: "bot";
  botResponse: {
    content: string;
    payload: {
      type: MessageType;
      recipe?: GeneratedRecipe;
    }
  }
}

export interface BotErrorMessageType extends BaseMessage {
  type: "bot_error";
  botResponse: {
    content: string;
    payload: {
      type: MessageType;
    }
  };
  userInputToRetry: UserInput;
}

export interface BotLoadingMessageType extends BaseMessage {
  type: "bot_loading";
  isLoading: true;
}

export type ChatMessageData = UserMessageType | BotMessageType | BotErrorMessageType | BotLoadingMessageType;

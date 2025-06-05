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

export const IngredientSchema = z.object({
  id: z.string().optional(),
  quantity: z.object({ type: z.literal("range"), low: z.number(), high: z.number() }),
  unit: unitEnum,
  description: z.string(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

// Base recipe schema with shared fields
export const BaseRecipeSchema = z.object({
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

// Schema for LLM-generated recipes
export const GeneratedRecipeSchema = BaseRecipeSchema;

// Schema for database write operations
export const RecipeWriteSchema = BaseRecipeSchema.extend({
  id: z.string().optional(),
  description: z.string().optional().default(""),
  thumbnail: z.string(),
  source_url: z.string(),
  source_name: z.string(),
  is_public: z.boolean().optional().default(false),
  user_id: z.string().optional(),
});

// Schema for database read operations (includes computed fields)
export const RecipeReadSchema = RecipeWriteSchema.extend({
  id: z.string(),
  user_id: z.string(),
  created_at: z.string().datetime({offset: true}).optional(),
  is_liked_by_current_user: z.boolean().optional(),
  like_count: z.number().optional(),
  profiles: z.object({
    display_name: z.string().nullable(),
    id: z.string(),
    avatar: z.string().nullable().optional(),
  }),
});

// Type definitions
export type BaseRecipe = z.infer<typeof BaseRecipeSchema>;
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;
export type RecipeWrite = z.infer<typeof RecipeWriteSchema>;
export type RecipeRead = z.infer<typeof RecipeReadSchema>;

// For backward compatibility, we can keep Recipe as an alias
export type Recipe = RecipeRead;

export type Unit = z.infer<typeof unitEnum>; 

export interface ImageData {
  url: string;
  type: "image/jpeg" | "image/png" | "image/heic";
  size: number;
}

export interface UserInput {
  message: string;
  webContent: Array<{ url: string; content: string }>;
  image?: ImageData;
}

export const MessageTypeSchema = z.enum([
  "text",
  "recipe",
  "teaser",
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ResponseMessage = z.object({
  type: MessageTypeSchema,
  content: z.string(),
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

export interface PublicProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  recipe_count?: number;
  total_likes?: number;
  avatar?: string | null;
}

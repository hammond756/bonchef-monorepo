import { z } from "zod"
import { unitTranslations } from "./translations"

// Import modes for recipe creation
export type ImportMode = "url" | "text" | "photo" | null

export const IngredientSchema = z.object({
    quantity: z.object({
        type: z.literal("range"),
        low: z.number(),
        high: z.number(),
    }),
    unit: z.string(),
    description: z.string(),
})

export const RecipeStatusEnum = z.enum(["DRAFT", "PUBLISHED"])

export type Ingredient = z.infer<typeof IngredientSchema>

// Base recipe schema with shared fields
export const BaseRecipeSchema = z.object({
    title: z.string(),
    n_portions: z.number(),
    total_cook_time_minutes: z.number(),
    ingredients: z.array(
        z.object({
            name: z.string(),
            ingredients: z.array(IngredientSchema),
        })
    ),
    instructions: z.array(z.string()),
})

// Schema for LLM-generated recipes
export const GeneratedRecipeSchema = BaseRecipeSchema

// Schema for database write operations
export const RecipeWriteSchema = BaseRecipeSchema.extend({
    id: z.string().optional(),
    description: z.string().optional().default(""),
    thumbnail: z.string(),
    source_url: z.string(),
    source_name: z.string(),
    is_public: z.boolean().optional().default(false),
    user_id: z.string().optional(),
    status: RecipeStatusEnum.optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
})

// Schema for database read operations (includes computed fields)
export const RecipeReadSchema = RecipeWriteSchema.extend({
    id: z.string(),
    user_id: z.string(),
    is_bookmarked_by_current_user: z.boolean().optional(),
    bookmark_count: z.number().optional(),
    profiles: z.object({
        display_name: z.string().nullable(),
        id: z.string(),
        avatar: z.string().nullable().optional(),
    }),
}).transform((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((group) => ({
        ...group,
        ingredients: group.ingredients.map((ingredient) => {
            let unit = ingredient.unit

            // For backward compatibility, transform old uppercase enum-like units to lowercase.
            const upperCaseUnit = unit.toUpperCase()
            const oldEnumStyleUnits = [
                "GRAM",
                "KILOGRAM",
                "MILLIGRAM",
                "MILLILITER",
                "LITER",
                "TEASPOON",
                "TABLESPOON",
                "SLICE",
                "WHOLE",
                "CLOVE",
                "BUNCH",
                "CENTIMETER",
                "PINCH",
                "DASH",
                "HANDFUL",
                "CAN",
                "JAR",
                "PACK",
                "SHEET",
                "SPRIG",
                "SCOOP",
                "NONE",
                "CUP",
            ]
            if (oldEnumStyleUnits.includes(upperCaseUnit)) {
                unit = unit.toLowerCase()
            }

            // Translate units to Dutch for display
            const translatedUnit = unitTranslations[unit]
            if (translatedUnit) {
                unit = translatedUnit
            }

            return { ...ingredient, unit: unit }
        }),
    })),
}))

// Type definitions
export type BaseRecipe = z.infer<typeof BaseRecipeSchema>
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>
export type RecipeWrite = z.infer<typeof RecipeWriteSchema>
export type RecipeRead = z.infer<typeof RecipeReadSchema>

// For backward compatibility, we can keep Recipe as an alias
export type Recipe = RecipeRead

export type Unit = string

export interface ImageData {
    url: string
    type: "image/jpeg" | "image/png" | "image/heic"
    size: number
}

export interface WebContent {
    url: string
    content: string
}

export interface UserInput {
    message: string
    webContent: WebContent[]
    image?: ImageData
}

export const MessageTypeSchema = z.enum(["text", "recipe", "teaser"])

export type MessageType = z.infer<typeof MessageTypeSchema>

export const ResponseMessage = z.object({
    type: MessageTypeSchema,
    content: z.string(),
})

export const LLMResponseSchema = z.object({
    messages: z.array(ResponseMessage),
})

export const IntentResponseSchema = z.object({
    intent: z.enum(["recipe", "modify", "question", "other", "teaser", "introduction"]),
})

export type LLMResponse = z.infer<typeof LLMResponseSchema>
export type IntentResponse = z.infer<typeof IntentResponseSchema>

export type Message = z.infer<typeof ResponseMessage>
export type AgentResponse = Message[]

export interface BaseMessage {
    type: "user" | "bot" | "bot_error" | "bot_loading"
    id: string | null
}

export interface UserMessageType extends BaseMessage {
    type: "user"
    userInput: UserInput
}

export interface BotMessageType extends BaseMessage {
    type: "bot"
    botResponse: {
        content: string
        payload: {
            type: MessageType
            recipe?: GeneratedRecipe
        }
    }
}

export interface BotErrorMessageType extends BaseMessage {
    type: "bot_error"
    botResponse: {
        content: string
        payload: {
            type: MessageType
        }
    }
    userInputToRetry: UserInput
}

export interface BotLoadingMessageType extends BaseMessage {
    type: "bot_loading"
    isLoading: true
}

export type ChatMessageData =
    | UserMessageType
    | BotMessageType
    | BotErrorMessageType
    | BotLoadingMessageType

export interface PublicProfile {
    id: string
    display_name: string | null
    bio: string | null
    recipe_count?: number
    total_bookmarks?: number
    avatar?: string | null
}

export const RecipeImportStatusEnum = z.enum(["pending", "completed", "failed"])
export const RecipeImportSourceTypeEnum = z.enum(["url", "image", "text"])

export const RecipeImportJobSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    status: RecipeImportStatusEnum,
    source_type: RecipeImportSourceTypeEnum,
    source_data: z.string(),
    recipe_id: z.string().nullable(),
    error_message: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type RecipeImportJob = z.infer<typeof RecipeImportJobSchema>

export type ServiceResponse<T> = Promise<
    | {
          success: false
          error: string
      }
    | {
          success: true
          data: T
      }
>

import { z } from "zod"
import { RecipeImportSourceTypeEnum } from "@/lib/types"

/*
started_recipe_import

Description: User started a recipe import job.
*/
export const StartedRecipeImportSchemaV1 = z.object({
    job_id: z.string().uuid(),
    method: RecipeImportSourceTypeEnum,
})

/*
added_recipe

Description: User added a recipe. This event is triggered
when a user saves the first draft of a recipe. The creation
of the draft is not tracked, since it is not a user action
but a system event.
However, there could be scenario's where a draft is actually
created by a user. In this case, the event should be triggered
with stage "draft".
*/
export const AddedRecipeSchemaV1 = z.object({
    method: RecipeImportSourceTypeEnum,
    recipe_count: z.number().nullable(),
    recipe_id: z.string().uuid(),
    stage: z.enum(["draft", "published"]),
    job_id: z.string().uuid().optional(),
})

/*
added_bookmark

Description: User added a recipe to their bookmarks.
*/
export const AddedBookmarkSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
})

/*
removed_bookmark

Description: User removed a recipe from their bookmarks.
*/
export const RemovedBookmarkSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
})

/*
liked_recipe

Description: User liked a recipe.
*/
export const LikedRecipeSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
})

/*
unliked_recipe

Description: User unliked a recipe.
*/
export const UnlikedRecipeSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
})

/*
added_comment

Description: User added a comment to a recipe.
*/
export const AddedCommentSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
    comment_length: z.number(),
})

/*
removed_comment

Description: User removed a comment from a recipe.
*/
export const RemovedCommentSchemaV1 = z.object({
    recipe_id: z.string().uuid(),
    is_own_recipe: z.boolean().nullable(),
})

// Define a more specific type for the analytics events
type AnalyticsEventDefinition = {
    // Versions are stored in a tuple. Index 0 is unused for 1-based versioning.
    readonly versions: readonly [null, ...z.ZodTypeAny[]]
    readonly current: number
}

export const AnalyticsEvents = {
    started_recipe_import: {
        versions: [null, StartedRecipeImportSchemaV1],
        current: 1,
    },
    added_recipe: {
        versions: [null, AddedRecipeSchemaV1],
        current: 1,
    },
    added_bookmark: {
        versions: [null, AddedBookmarkSchemaV1],
        current: 1,
    },
    removed_bookmark: {
        versions: [null, RemovedBookmarkSchemaV1],
        current: 1,
    },
    liked_recipe: {
        versions: [null, LikedRecipeSchemaV1],
        current: 1,
    },
    unliked_recipe: {
        versions: [null, UnlikedRecipeSchemaV1],
        current: 1,
    },
    added_comment: {
        versions: [null, AddedCommentSchemaV1],
        current: 1,
    },
    removed_comment: {
        versions: [null, RemovedCommentSchemaV1],
        current: 1,
    },
} as const satisfies Record<string, AnalyticsEventDefinition>

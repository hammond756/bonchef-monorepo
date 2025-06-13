"use server"

import { StorageService } from "@/lib/services/storage-service"
import { PublicProfile, RecipeRead, RecipeReadSchema } from "@/lib/types"
import { createAnonymousClient, createClient } from "@/utils/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

interface OwnedRecipe {
    recipe_likes: {
        count: number
    }[]
}

interface ProfileData {
    id: string
    display_name: string
    bio: string
    avatar: string
    recipe_creation_prototype: OwnedRecipe[]
}

function transformProfileData(data: ProfileData): PublicProfile {
    const total_likes_received = data.recipe_creation_prototype?.reduce((acc, recipe) => {
        // The query returns an array with a single object for recipes with likes: `[{ count: number }]`, or an empty array.
        const likesForRecipe = recipe.recipe_likes[0]?.count || 0
        return acc + likesForRecipe
    }, 0)

    const recipe_count = data.recipe_creation_prototype?.length || 0

    return {
        id: data.id,
        display_name: data.display_name,
        bio: data.bio,
        avatar: data.avatar,
        recipe_count,
        total_likes: total_likes_received,
    }
}

function profileQuery(supabase: SupabaseClient) {
    return supabase.from("profiles").select(`
      id,
      display_name,
      bio,
      avatar,
      recipe_likes (count),
      recipe_creation_prototype!recipe_creation_prototype_user_id_fkey (
        recipe_likes (
          count
        )
      )
    `)
}

export async function getPublicProfileByUserId(userId: string): Promise<PublicProfile | null> {
    const supabase = await createAnonymousClient()

    const { data, error } = await profileQuery(supabase).eq("id", userId).single()

    if (error || !data) {
        return null
    }

    return transformProfileData(data)
}

export async function getOwnProfile() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return null
    }
    const { data, error } = await profileQuery(supabase).eq("id", user.id).single()
    if (error) {
        throw new Error("Failed to fetch own profile")
    }
    return transformProfileData(data)
}

export async function deleteProfileAvatarImage(previousAvatarUrl: string | null) {
    if (!previousAvatarUrl || !previousAvatarUrl.includes("profile_avatars")) return
    const supabase = await createClient()
    try {
        const url = new URL(previousAvatarUrl)
        const pathMatch = url.pathname.match(/profile_avatars\/([^?]+)/)
        const filePath = pathMatch ? decodeURIComponent(pathMatch[1]) : null
        if (filePath) {
            await supabase.storage.from("profile_avatars").remove([filePath])
        }
    } catch (e) {
        console.error("Failed to delete old avatar from storage", e)
    }
}

export async function uploadProfileAvatarImage(userId: string, image: File) {
    const supabase = await createClient()
    const storageService = new StorageService(supabase)
    const fileExt = image.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const url = await storageService.uploadImage(
        "profile_avatars",
        image,
        true,
        `${userId}/${fileName}`
    )
    return url
}

export async function updateUserProfile(
    userId: string,
    displayName: string | null,
    bio: string | null,
    avatar?: string | null
) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("profiles")
        .update({
            display_name: displayName,
            bio: bio,
            avatar: avatar || null,
        })
        .eq("id", userId)
    if (error) {
        throw new Error("Failed to update profile")
    }
}

export async function getPublicRecipesByUserId(userId: string): Promise<RecipeRead[]> {
    const supabase = await createAnonymousClient()

    const { data, error } = await supabase
        .from("recipe_creation_prototype")
        .select(
            `
      id,
      title,
      description,
      thumbnail,
      created_at,
      total_cook_time_minutes,
      n_portions,
      ingredients,
      instructions,
      is_public,
      user_id,
      profiles!recipe_creation_prototype_user_id_fkey(display_name, id),
      is_liked_by_current_user,
      recipe_likes (
        count
      ),
      source_url,
      source_name
    `
        )
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

    if (error) {
        console.error(error)
        throw new Error("Failed to fetch public recipes")
    }

    const validatedRecipes = z.array(RecipeReadSchema).parse(
        data.map((recipe) => ({
            ...recipe,
            like_count: recipe.recipe_likes?.[0]?.count || 0,
            recipe_likes: undefined,
        }))
    )

    return validatedRecipes
}

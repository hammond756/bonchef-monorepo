"use server"

import { getServerBaseUrl } from "@/lib/utils"
import { cookies, headers } from "next/headers"

export async function getRecipe(id: string) {
    const baseUrl = getServerBaseUrl(await headers())

    const response = await fetch(`${baseUrl}/api/public/recipes/${id}`, {
        headers: {
            Cookie: (await cookies()).toString(),
        },
    })

    if (!response.ok) {
        console.error(response)
        return null
    }

    const { recipe, error } = await response.json()

    if (error) {
        console.error(error)
        return null
    }

    return recipe
}

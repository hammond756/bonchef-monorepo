"use server"

import { cookies } from "next/headers"


export async function getRecipe(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`, {
    headers: {
      "Cookie": (await cookies()).toString()
    }
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

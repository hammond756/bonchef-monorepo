import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";

export async function POST(request: Request) {
  const recipe = GeneratedRecipeSchema.parse(await request.json());

  // TODO: Implement actual save logic
  // For now, return a mock URL
  return NextResponse.json({ url: "/recipes/mock-id" });
} 
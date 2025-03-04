import { Suspense } from "react"
import { PublicRecipeTimeline } from "@/components/public-recipe-timeline"
import { PublicRecipeTimelineSkeleton } from "@/components/public-recipe-timeline-skeleton"
import { createClient } from "@/utils/supabase/server"

export default async function OntdekPage() {
  // Get the user but don't redirect if not authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ontdek recepten</h1>
      <p className="text-lg text-gray-700 mb-8">
        Ontdek wat andere mensen koken en laat je inspireren door hun recepten.
      </p>
      
      <Suspense fallback={<PublicRecipeTimelineSkeleton />}>
        <PublicRecipeTimeline />
      </Suspense>
    </main>
  )
} 
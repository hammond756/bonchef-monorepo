import { ScrapeRecipe } from "@/components/scrape-recipe";
import { SubmitRecipe } from "@/components/submit-recipe";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bonchef Prototype</h1>
      <p className="text-sm text-muted-foreground mb-6">Maak een recept op basis van een beschrijving. Dit kan heel basic
        zijn, of een bijna volledig recept. We vullen zelf de nodige details in.
      </p>
      <SubmitRecipe />
      <Separator className="my-16" text="Of" />
      <p className="text-sm text-muted-foreground mb-6">Haal een recept op van een website.</p>
      <ScrapeRecipe />
    </main>
  );
}

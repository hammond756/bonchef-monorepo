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
      <h2 className="text-2xl font-bold mb-6">Optie 1</h2>
      <p className="text-sm text-muted-foreground mb-6">Maak een recept op basis van een beschrijving. Dit kan heel basic
        zijn, of een bijna volledig recept. We vullen zelf de nodige details in.
      </p>
      <SubmitRecipe />
      <Separator className="my-16"/>
      <h2 className="text-2xl font-bold mb-6">Optie 2</h2>
      <p className="text-sm text-muted-foreground mb-6">Haal een recept op van een website.</p>
      <ScrapeRecipe />
    </main>
  );
}

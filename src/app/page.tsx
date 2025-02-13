import { SubmitRecipe } from "@/components/submit-recipe";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bonchef Prototype</h1>
      <SubmitRecipe />
    </main>
  );
}

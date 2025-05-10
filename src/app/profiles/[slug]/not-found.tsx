import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Profiel niet gevonden</h1>
        <p className="text-muted-foreground mb-8">
          Het profiel dat je zoekt bestaat niet of is niet beschikbaar.
        </p>
        <Button asChild>
          <Link href="/">Ga terug</Link>
        </Button>
      </div>
    </main>
  );
} 
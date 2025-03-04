import { Card } from "@/components/ui/card"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Account aanmaken</h1>
          <p className="text-sm text-muted-foreground">
            Maak een account aan om gebruik te maken van Bonchef.
          </p>
        </div>
        <SignUpForm />
      </Card>
    </div>
  )
} 
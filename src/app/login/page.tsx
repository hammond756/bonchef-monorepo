import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Welkom!</h1>
          <p className="text-sm text-muted-foreground">
            Dit is een prototype voor Bonchef. Als je nog geen account hebt, klik
            dan op de link onder het formulier om er een te maken.
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
} 
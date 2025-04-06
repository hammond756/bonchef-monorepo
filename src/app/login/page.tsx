import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
export default function LoginPage() {
  return (
    <div className="flex h-full w-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Welkom!</h1>
          <p className="text-sm text-muted-foreground">
            Dit is een prototype. Log in om alle features te gebruiken, of bekijk publieke recepten <Link href="/ontdek" className="underline">op de timeline</Link>. Alleen even proberen? Log dan in met een test account.
          </p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
} 
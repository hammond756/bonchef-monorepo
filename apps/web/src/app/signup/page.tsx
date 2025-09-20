import { Card } from "@/components/ui/card"
import { SignUpForm } from "@/components/auth/signup-form"
import { Suspense } from "react"

export default function SignUpPage() {
    return (
        <div className="flex w-screen flex-1 items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold">Account aanmaken</h1>
                    <p className="text-muted-foreground text-sm">
                        Maak een account aan om gebruik te maken van Bonchef.
                    </p>
                </div>
                <Suspense>
                    <SignUpForm />
                </Suspense>
            </Card>
        </div>
    )
}

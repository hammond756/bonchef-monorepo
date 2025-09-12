"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useThirdPartyLogin } from "@/hooks/use-third-party-login"

interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<{ error: string | null }>
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { login: thirdPartyLogin, isLoading: isThirdPartyLoading } = useThirdPartyLogin()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await onLogin(email, password)

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error,
            })
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Button
                type="button"
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => thirdPartyLogin("google")}
                disabled={isThirdPartyLoading}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g clipPath="url(#clip0_9914_10)">
                        <path
                            d="M19.8052 10.2307C19.8052 9.55098 19.7491 8.8678 19.629 8.2002H10.2V12.0498H15.6261C15.3932 13.2998 14.6523 14.3748 13.6073 15.0748V17.3348H16.7272C18.5272 15.6848 19.8052 13.2307 19.8052 10.2307Z"
                            fill="#4285F4"
                        />
                        <path
                            d="M10.2 20.0002C12.7009 20.0002 14.8073 19.1491 16.3273 17.3348L13.6073 15.0748C12.7823 15.6348 11.6523 15.9998 10.2 15.9998C7.78913 15.9998 5.73913 14.3348 4.96413 12.0998H1.12793V14.4248C2.69913 17.6848 6.20087 20.0002 10.2 20.0002Z"
                            fill="#34A853"
                        />
                        <path
                            d="M4.96413 12.0998C4.76413 11.5398 4.65217 10.9348 4.65217 10.2998C4.65217 9.6648 4.76413 9.0598 4.96413 8.4998V6.1748H1.12793C0.40913 7.6348 0 9.1998 0 10.2998C0 11.3998 0.40913 12.9648 1.12793 14.4248L4.96413 12.0998Z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M10.2 4.5998C11.4891 4.5998 12.6273 5.0498 13.5273 5.8998L16.3932 3.0348C14.8073 1.4998 12.7009 0.5998 10.2 0.5998C6.20087 0.5998 2.69913 2.9148 1.12793 6.1748L4.96413 8.4998C5.73913 6.2648 7.78913 4.5998 10.2 4.5998Z"
                            fill="#EA4335"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_9914_10">
                            <rect width="20" height="20" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
                Log in met Google
            </Button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">Of</span>
                </div>
            </div>
            <div className="space-y-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Inloggen..." : "Inloggen"}
                </Button>
                <div className="text-center text-sm">
                    <Link href="/signup" className="text-primary underline">
                        Nog geen account? Meld je dan hier aan
                    </Link>
                </div>
            </div>
        </form>
    )
}

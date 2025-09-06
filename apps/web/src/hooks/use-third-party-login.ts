import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"
import { useState } from "react"
import { loginWithGoogle } from "@/app/login/actions"

export function useThirdPartyLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function login(_provider: "google") {
        setIsLoading(true)
        try {
            const { redirectUrl, error } = await loginWithGoogle()

            if (redirectUrl) {
                setIsLoading(false)
                router.push(redirectUrl)
                return
            }

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error,
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to login with Google",
            })
        }
    }

    return { login, isLoading }
}

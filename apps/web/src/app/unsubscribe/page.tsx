import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UnsubscribeService } from "@/lib/services/unsubscribe-service"

export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{
        success?: string
        type?: string
        error?: string
        u?: string
        t?: string
    }>
}) {
    const params = await searchParams
    const isSuccess = params.success === "true"
    const hasError = params.error
    const userId = params.u
    const type = params.t

    // Process unsubscribe if we have user ID and type
    if (userId && type && !isSuccess && !hasError) {
        const validation = UnsubscribeService.validateUnsubscribeParams(userId, type)

        if (validation.valid) {
            const result = await UnsubscribeService.unsubscribeUser(userId, type)

            if (result.success) {
                // Redirect to success page
                return (
                    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="mb-6 font-serif text-3xl">
                                    Je bent afgemeld
                                </CardTitle>

                                <CardDescription>
                                    Je ontvangt geen meldingen meer over reacties op je recepten.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Terug naar Bonchef
                                        </Link>
                                    </Button>

                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/collection">Mijn Recepten</Link>
                                    </Button>
                                </div>

                                <div className="text-muted-foreground mt-6 text-xs">
                                    <p>
                                        Heb je vragen? Neem contact op via{" "}
                                        <a
                                            href="mailto:welkom@bonchef.io"
                                            className="text-primary hover:underline"
                                        >
                                            welkom@bonchef.io
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            } else {
                // Show error page
                return (
                    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader className="text-center">
                                <CardTitle className="text-destructive text-xl">
                                    Fout opgetreden
                                </CardTitle>
                                <CardDescription>
                                    Er is iets misgegaan bij het afmelden. Probeer het later
                                    opnieuw.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Terug naar Bonchef
                                        </Link>
                                    </Button>
                                </div>

                                <div className="text-muted-foreground mt-6 text-xs">
                                    <p>
                                        Heb je vragen? Neem contact op via{" "}
                                        <a
                                            href="mailto:welkom@bonchef.io"
                                            className="text-primary hover:underline"
                                        >
                                            welkom@bonchef.io
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        } else {
            // Show validation error page
            return (
                <div className="bg-surface flex min-h-screen items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-destructive text-xl">
                                Ongeldige link
                            </CardTitle>
                            <CardDescription>
                                Deze afmeldlink is niet geldig of verlopen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Terug naar Bonchef
                                    </Link>
                                </Button>
                            </div>

                            <div className="text-muted-foreground mt-6 text-xs">
                                <p>
                                    Heb je vragen? Neem contact op via{" "}
                                    <a
                                        href="mailto:welkom@bonchef.io"
                                        className="text-primary hover:underline"
                                    >
                                        welkom@bonchef.io
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    }

    // Show default page for direct visits
    return (
        <div className="bg-surface flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Afmelden</CardTitle>
                    <CardDescription>
                        Bevestig dat je je wilt afmelden voor e-mail notificaties.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Terug naar Bonchef
                            </Link>
                        </Button>
                    </div>

                    <div className="text-muted-foreground mt-6 text-xs">
                        <p>
                            Heb je vragen? Neem contact op via{" "}
                            <a
                                href="mailto:welkom@bonchef.io"
                                className="text-primary hover:underline"
                            >
                                welkom@bonchef.io
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

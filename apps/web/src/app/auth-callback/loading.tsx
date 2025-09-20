export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">Verificatie...</h2>
                <p className="text-muted-foreground text-sm">Wacht even terwijl we je inloggen</p>
                <div className="mt-4 flex justify-center">
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                </div>
            </div>
        </div>
    )
}

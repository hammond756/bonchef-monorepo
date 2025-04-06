export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Verificatie...</h2>
        <p className="text-sm text-muted-foreground">Wacht even terwijl we je inloggen</p>
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
} 
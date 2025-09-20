/**
 * Layout component for Dishcovery feature.
 * Provides full-screen layout for camera and description screens.
 */

export default function DishcoveryLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <div className="flex h-[100dvh] w-full flex-col bg-black">{children}</div>
}

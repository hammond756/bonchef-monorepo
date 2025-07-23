import type { Metadata } from "next"
import { Montserrat, Lora } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { PostHogProvider } from "@/components/PostHogProvider"
import { ModalProvider } from "@/components/modal-provider"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger"

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    display: "swap",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
})

const lora = Lora({
    variable: "--font-lora",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
})

export const metadata: Metadata = {
    title: "Bonchef",
    description: "Wat eten we vandaag?",
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover", // Important for safe area handling
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${lora.variable} bg-surface antialiased`}>
                <PostHogProvider>
                    <NuqsAdapter>
                        <ModalProvider />
                        <OnboardingModal />
                        <OnboardingTrigger />
                        {children}
                        <Toaster />
                    </NuqsAdapter>
                </PostHogProvider>
                <div id="modal-portal" />
            </body>
        </html>
    )
}

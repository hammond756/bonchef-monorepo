import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { PostHogProvider } from "@/components/PostHogProvider";
import { TopBar } from "@/components/layout/top-bar";
import { TabBar } from "@/components/layout/tab-bar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Bonchef",
  description: "Wat eten we vandaag?",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lora.variable} antialiased bg-white`}>
        <PostHogProvider>
          <NuqsAdapter>
            <div className="flex flex-col min-h-screen bg-slate-50">
              <TopBar />
              <main className="flex flex-grow overflow-y-auto w-full">
                {children}
              </main>
              <TabBar />
            </div>
            <Toaster />
          </NuqsAdapter>
        </PostHogProvider>
      </body>
    </html>
  );
}

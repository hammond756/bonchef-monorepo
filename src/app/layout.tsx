import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { PostHogProvider } from "@/components/PostHogProvider";

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
            <Sidebar />
            <main className="pt-16 h-dvh">{children}</main>
            <Toaster />
          </NuqsAdapter>
        </PostHogProvider>
      </body>
    </html>
  );
}

"use client"; // Mark BaseLayout as a client component

import { BackButton } from "@/components/ui/back-button";

interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <BackButton />
      
      <main className="flex flex-1 flex-col justify-center">
        {children}
      </main>
    </div>
  );
}; 
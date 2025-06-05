'use client';

import { Share2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Shadcn Button voor styling
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react'; // Import React for Fragment if not already there

interface ShareRecipeButtonProps {
  title: string;
  text: string; // Bijvoorbeeld een korte beschrijving of gewoon de titel nogmaals
  className?: string;
  buttonContainerClassName?: string; // New prop for the outer div styling
}

export function ShareRecipeButton({ title, text, className, buttonContainerClassName }: ShareRecipeButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text,
      url: window.location.href, // Deel de huidige pagina URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Optioneel: toast bericht voor succes
        // toast({ title: 'Recept gedeeld!' }); 
      } catch (error) {
        // Gebruiker annuleert delen of er is een fout opgetreden
        // Je kunt hier een toast tonen als het geen AbortError is, 
        // maar vaak is het niet nodig om de gebruiker lastig te vallen als ze zelf annuleren.
        if ((error as Error).name !== 'AbortError') {
          console.error('Fout bij delen:', error);
          toast({
            title: 'Fout bij delen',
            description: 'Kon het recept niet delen. Probeer het later opnieuw.',
            variant: 'destructive',
          });
        }
      }
    } else {
      // Fallback voor browsers die navigator.share niet ondersteunen
      // Kopieer naar klembord als simpele fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link gekopieerd!',
          description: 'De link naar het recept is naar je klembord gekopieerd.',
        });
      } catch (err) {
        toast({
          title: 'Delen niet ondersteund',
          description: 'Je browser ondersteunt deze deelfunctie niet en de link kon niet worden gekopieerd.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center", buttonContainerClassName)}>
      <Button
        variant="ghost" 
        size="icon"      
        className={cn(
          "rounded-full h-12 w-12",
          "bg-white/80 hover:bg-white/95",
          "text-gray-700 hover:text-gray-900",
          className
        )}
        onClick={handleShare}
        aria-label="Deel recept"
      >
        <Share2Icon className="h-6 w-6" />
      </Button>
      <span className="text-white text-xs mt-1 font-medium drop-shadow-sm">
        Delen
      </span>
    </div>
  );
} 
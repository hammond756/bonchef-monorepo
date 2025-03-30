import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function ShowMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-4 left-0 right-0 flex justify-center">
        <Button
        onClick={onClick}
        className="rounded-full bg-white shadow-md hover:bg-gray-50 flex items-center gap-2 px-4 py-2 text-center"
        >
        <ChevronDown className="h-4 w-4 text-black" />
        <span className="text-black">Toon meer</span>
        </Button>
  </div>
  )
}
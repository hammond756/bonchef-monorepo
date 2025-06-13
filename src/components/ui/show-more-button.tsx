import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function ShowMoreButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="sticky right-0 bottom-4 left-0 flex justify-center">
            <Button
                onClick={onClick}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-center shadow-md hover:bg-gray-50"
            >
                <ChevronDown className="h-4 w-4 text-black" />
                <span className="text-black">Toon meer</span>
            </Button>
        </div>
    )
}

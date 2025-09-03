import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"

interface TextInputProps {
    value: string
    onChange: (value: string) => void
    onSwitchToVoice: () => void
    onError: (error: string | null) => void
    error: string | null
}

/**
 * Text input component for manual description entry
 * Pure UI component that receives all data and callbacks via props
 */
export function TextInput({
    value,
    onChange,
    onSwitchToVoice,
    onError,
    error,
}: Readonly<TextInputProps>) {
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        onChange(newValue)

        // Clear any previous errors when user types
        if (error) {
            onError(null)
        }
    }

    return (
        <div className="mb-6">
            <Textarea
                value={value}
                onChange={handleTextChange}
                placeholder="Beschrijf de ingrediënten, smaken, kruiden, en bereidingswijze die je ziet of weet..."
                className="min-h-[100px] resize-none border-gray-300 bg-white text-base text-gray-800 placeholder:text-gray-500 sm:min-h-[120px]"
                maxLength={500}
                aria-label="Beschrijving van het gerecht"
                aria-describedby="text-counter text-instructions"
            />
            <div id="text-counter" className="mt-2 text-right text-xs text-gray-500">
                {value.length}/500
            </div>

            {/* "Toch liever spreken" button */}
            <div className="mt-4 text-center">
                <Button
                    variant="outline"
                    size="default"
                    onClick={onSwitchToVoice}
                    className="border-text-muted text-text-default h-10 hover:bg-gray-50 sm:h-9"
                >
                    <Mic className="mr-2 h-4 w-4" />
                    Toch liever spreken
                </Button>
            </div>
        </div>
    )
}

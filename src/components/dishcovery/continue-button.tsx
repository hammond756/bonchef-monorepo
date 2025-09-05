import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface ContinueButtonProps {
    onClick: () => void
    disabled: boolean
    isProcessing: boolean
}

/**
 * Continue button component with loading state
 * Pure UI component that receives all data and callbacks via props
 */
export function ContinueButton({ onClick, disabled, isProcessing }: Readonly<ContinueButtonProps>) {
    return (
        <div className="text-center">
            <Button
                onClick={onClick}
                disabled={disabled}
                className="bg-accent-new hover:bg-status-green-text disabled:bg-text-muted w-full text-white shadow-lg disabled:cursor-not-allowed"
                size="lg"
                aria-describedby={isProcessing ? "button-status" : undefined}
            >
                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center"
                        >
                            <motion.div
                                className="mr-2 h-5 w-5 rounded-full border-2 border-current border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            Bezig...
                            <span id="button-status" className="sr-only">
                                Recept wordt gegenereerd, even geduld
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center"
                        >
                            <span>Bonchef!!</span>
                            <img
                                src="/icons/ok-hand-white-med-svgrepo-com.svg"
                                alt="OK"
                                className="ml-2 h-7 w-7"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    )
}

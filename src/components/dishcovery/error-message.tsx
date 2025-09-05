import { motion, AnimatePresence } from "framer-motion"

interface ErrorMessageProps {
    error: string | null
}

/**
 * Error message component with animation
 * Pure UI component that receives error state via props
 */
export function ErrorMessage({ error }: Readonly<ErrorMessageProps>) {
    return (
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-status-red-bg border-status-red-border mb-4 rounded-lg border p-3"
                    role="alert"
                    aria-live="polite"
                >
                    <p className="text-status-red-text text-sm">{error}</p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

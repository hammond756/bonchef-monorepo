"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ProgressModalProps {
    progressSteps: string[]
    stepDuration?: number
    loop?: boolean
}

export function ProgressModal({
    progressSteps,
    stepDuration = 3000,
    loop = false,
}: ProgressModalProps) {
    const [stepIndex, setStepIndex] = useState(0)

    useEffect(() => {
        if (stepIndex < progressSteps.length - 1 || loop) {
            const timeout = setTimeout(() => {
                setStepIndex((prev) => (prev + 1) % progressSteps.length)
            }, stepDuration)
            return () => clearTimeout(timeout)
        }
    }, [stepIndex, loop, progressSteps.length, stepDuration])

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex min-h-[300px] w-full max-w-2xl flex-col justify-center space-y-8 rounded-2xl bg-white px-12 py-16 text-center shadow-xl">
                <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-lg font-medium"
                    >
                        {progressSteps[stepIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ProgressModal

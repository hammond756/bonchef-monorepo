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
    const [displayedSteps, setDisplayedSteps] = useState(progressSteps)

    // This effect handles the 25-second timeout to add the extra message
    useEffect(() => {
        const timeout = setTimeout(() => {
            // Only add the message if the modal is still active and looping
            if (loop) {
                setDisplayedSteps((prevSteps) => {
                    const newMessage =
                        "We zijn écht bezig met je recept, maar het duurt iets langer dan verwacht."
                    // Avoid adding the message if it's already there
                    if (prevSteps.includes(newMessage)) {
                        return prevSteps
                    }
                    return [...prevSteps, newMessage]
                })
            }
        }, 25000) // 25 seconds

        return () => clearTimeout(timeout)
    }, [loop]) // This effect runs once when the component mounts with loop=true

    // This effect handles cycling through the steps
    useEffect(() => {
        if (stepIndex < displayedSteps.length - 1 || loop) {
            const timeout = setTimeout(() => {
                setStepIndex((prev) => (prev + 1) % displayedSteps.length)
            }, stepDuration)
            return () => clearTimeout(timeout)
        }
    }, [stepIndex, loop, displayedSteps.length, stepDuration])

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex min-h-[300px] w-full max-w-2xl flex-col justify-center space-y-8 rounded-2xl bg-white px-12 py-16 text-center shadow-xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-lg font-medium"
                    >
                        {displayedSteps[stepIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ProgressModal

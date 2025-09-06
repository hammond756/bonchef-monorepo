import { AnimatePresence, motion } from "framer-motion"

export function NotificationBadge({ totalCount }: { totalCount: number }) {
    return (
        <AnimatePresence mode="wait">
            {totalCount > 0 && (
                <motion.span
                    key={totalCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.3, 1],
                        opacity: 1,
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        scale: {
                            times: [0, 0.6, 1],
                            duration: 0.4,
                        },
                    }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >
                    {totalCount}
                </motion.span>
            )}
        </AnimatePresence>
    )
}

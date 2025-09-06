import { useState, useCallback } from "react"

export function useJiggleAnimation(duration: number = 400) {
    const [shouldJiggle, setShouldJiggle] = useState(false)

    const triggerJiggle = useCallback(() => {
        setShouldJiggle(true)
        setTimeout(() => setShouldJiggle(false), duration + 20)
    }, [duration])

    return { shouldJiggle, triggerJiggle }
}

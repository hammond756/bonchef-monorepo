"use client"

import { TopBar } from "@/components/layout/top-bar"
import { TabBar } from "@/components/layout/tab-bar"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TabLayoutProps {
    children: React.ReactNode
    topBarContent?: React.ReactNode
    tabBarContent?: React.ReactNode
}

export const TabLayout = ({ children, topBarContent, tabBarContent }: TabLayoutProps) => {
    const mainRef = useRef<HTMLElement>(null)
    const scrollDirection = useScrollDirection(10, mainRef)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollDirection === "down") {
                setIsVisible(false)
            } else if (scrollDirection === "up") {
                setIsVisible(true)
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [scrollDirection])

    return (
        <div className="bg-surface relative flex h-screen flex-col">
            <header
                className={cn(
                    "fixed top-0 right-0 left-0 z-50 transition-transform duration-300 ease-in-out",
                    {
                        "-translate-y-full": !isVisible,
                        "translate-y-0": isVisible,
                    }
                )}
            >
                <TopBar>{topBarContent}</TopBar>
            </header>

            <main
                ref={mainRef}
                className="flex-1 overflow-y-auto"
                style={{
                    paddingTop: "56px", // Adjust as needed for TopBar height
                    paddingBottom: "80px", // Adjust as needed for TabBar height
                }}
            >
                {children}
            </main>

            <footer
                className={cn(
                    "fixed right-0 bottom-0 left-0 z-50 pt-8 transition-transform duration-300 ease-in-out",
                    {
                        "translate-y-full": !isVisible,
                        "translate-y-0": isVisible,
                    }
                )}
            >
                <TabBar>{tabBarContent}</TabBar>
            </footer>
        </div>
    )
}

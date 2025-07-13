"use client"

import { TopBar } from "@/components/layout/top-bar"
import { TabBar } from "@/components/layout/tab-bar"
import { cn } from "@/lib/utils"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"

interface TabLayoutProps {
    children: React.ReactNode
    topBarContent?: React.ReactNode
    tabBarContent?: React.ReactNode
}

export const TabLayout = ({ children, topBarContent, tabBarContent }: TabLayoutProps) => {
    const { isVisible } = useNavigationVisibility()

    return (
        <div className="bg-surface relative flex min-h-full flex-col">
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
                className="flex-1"
                style={{
                    paddingTop: "56px",
                    paddingBottom: "80px",
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

import { TopBar } from "@/components/layout/top-bar"
import { TabBar } from "@/components/layout/tab-bar"

interface TabLayoutProps {
    children: React.ReactNode
    topBarContent?: React.ReactNode
    tabBarContent?: React.ReactNode
}

export const TabLayout = ({ children, topBarContent, tabBarContent }: TabLayoutProps) => {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <TopBar>{topBarContent}</TopBar>

            <main className="flex flex-1 justify-center">{children}</main>

            <TabBar>{tabBarContent}</TabBar>
        </div>
    )
}

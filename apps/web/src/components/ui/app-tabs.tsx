"use client"
import * as React from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabDefinition {
    value: string
    label: string
    disabled?: boolean
}

interface AppTabsListProps {
    tabs: TabDefinition[]
    className?: string
}

export function AppTabsList({ tabs, className }: AppTabsListProps) {
    return (
        <TabsList
            className={cn(
                "border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0",
                className
            )}
        >
            {tabs.map((tab) => (
                <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={tab.disabled}
                    className={cn(
                        "text-muted-foreground hover:text-foreground data-[state=active]:text-status-green-text relative h-10 flex-1 rounded-none bg-transparent px-4 pt-2 pb-3 text-base font-medium shadow-none transition-colors data-[state=active]:font-semibold data-[state=active]:shadow-none",
                        "after:bg-status-green-text after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100"
                    )}
                >
                    {tab.label}
                </TabsTrigger>
            ))}
        </TabsList>
    )
}

// export function AppTabs({
//   tabs,
//   value,
//   defaultValue,
//   onValueChange,
//   tabsListClassName,
//   tabsRootClassName,
// }: AppTabsProps) {
//   return (
//     <Tabs
//       value={value}
//       defaultValue={defaultValue}
//       onValueChange={onValueChange}
//       className={cn(tabsRootClassName)}
//     >
//       <TabsList className={cn(defaultTabsListClassName, tabsListClassName)}>
//         {tabs.map((tab) => (
//           <TabsTrigger
//             key={tab.value}
//             value={tab.value}
//             disabled={tab.disabled}
//             className={defaultTabTriggerClassName} // Gebruik de vaste class hier
//           >
//             {tab.label}
//           </TabsTrigger>
//         ))}
//       </TabsList>
//       {/*
//         Belangrijk: De TabsContent moet nog steeds door de parent component worden afgehandeld
//         en buiten deze AppTabs component worden geplaatst, omdat de inhoud ervan specifiek is
//         voor elke implementatie.
//         Deze AppTabs component focust zich alleen op het renderen van de Tabs, TabsList en TabsTriggers.
//       */}
//     </Tabs>
//   );
// }

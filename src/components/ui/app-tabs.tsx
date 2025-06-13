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
}

const defaultTabTriggerClassName =
    "flex-1 py-3 px-2 text-base transition-all duration-200 relative text-gray-500 font-medium hover:text-green-600 data-[state=active]:text-green-700 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-green-700 data-[state=active]:bg-white data-[state=active]:rounded-md data-[state=active]:shadow-sm"
const defaultTabsListClassName =
    "flex border-b border-gray-200 rounded-lg p-1 bg-bonchef-green-tab w-full"

export function AppTabsList({ tabs }: AppTabsListProps) {
    return (
        <TabsList className={cn(defaultTabsListClassName)}>
            {tabs.map((tab) => (
                <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={tab.disabled}
                    className={defaultTabTriggerClassName} // Gebruik de vaste class hier
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

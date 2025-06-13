import { cn } from "@/lib/utils"

export function ImportButton({
    onClick,
    icon,
    backgroundColor,
    title,
    description,
    className,
}: {
    onClick: () => void
    icon: React.ReactNode
    backgroundColor: string
    title: string
    description: string
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-4 rounded-lg border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50",
                className
            )}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${backgroundColor}`}
                >
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
            </div>
        </button>
    )
}

import { Camera, Link, User, FileText, Globe, MessageSquare, Sparkles, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  icon: LucideIcon
  label: string
  onClick: () => void
}

interface QuickActionsProps {
  actions: QuickAction[]
  surpriseAction: () => void
  onPromptClick: (prompt: string) => void
}

export function QuickActions({ actions, surpriseAction, onPromptClick }: QuickActionsProps) {
  const quickPrompts = [
    "Vegan comfortfood",
    "Iets snel en gezonds",
    "Iets lichts voor het sporten",
    "Iets lekkers voor in het park",
    "Een goede lunch om mee te nemen naar werk",
  ]

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Wat eten we vandaag?</h1>
        <p className="text-muted-foreground">
          Maak snel en eenvoudig je eigen recept
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Kies een snelle actie</h2>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 p-4 rounded-lg text-left",
                "bg-green-50 hover:bg-green-100 transition-colors",
                "border border-green-200"
              )}
            >
              <action.icon className="h-5 w-5 text-green-700" />
              <span>{action.label}</span>
            </button>
          ))}

        <button
          onClick={surpriseAction}
          className={cn(
            "flex items-center gap-2 p-4 rounded-lg text-left",
            "bg-purple-50 hover:bg-purple-100 transition-colors",
            "border border-purple-200"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-700" />
            <span>Verras me</span>
          </div>
        </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Kies een snelle instructie</h2>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className={cn(
                "px-4 py-2 rounded-full",
                "bg-white hover:bg-gray-50 transition-colors",
                "border border-gray-200"
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 
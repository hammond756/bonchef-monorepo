export function ImportButton({ onClick, icon, backgroundColor, title, description }: { onClick: () => void, icon: React.ReactNode, backgroundColor: string, title: string, description: string }) {
    return (
      <button onClick={onClick} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left w-full">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${backgroundColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </button>
    )
  }
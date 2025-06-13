"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({
  placeholder = "Zoek recepten, ingrediënten of chefs...",
  className,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }
    router.push(`/ontdek?${params.toString()}`)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(event.currentTarget.value)
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="h-12 w-full rounded-full bg-gray-100 pl-10 pr-4"
        onKeyDown={handleKeyDown}
        defaultValue={searchParams.get("q") || ""}
      />
    </div>
  )
} 
"use client"

import { User } from "@supabase/supabase-js"
import { LogOut, Menu, MessageSquarePlus, Plus, X } from "lucide-react"
import { logout } from "@/app/actions"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/store/chat-store"
import { useRouter } from "next/navigation"
export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const { clearConversation } = useChatStore()
  const router = useRouter()
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Close sidebar when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      
      // Check if click is outside sidebar and not on the toggle button
      if (isOpen && 
          !target.closest("[data-sidebar]") && 
          !target.closest("[data-sidebar-toggle]")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  function handleNewChat() {
    clearConversation()
    router.push("/")
  }

  return (
    <>
      {/* Top bar with hamburger menu */}
      <div className="fixed top-0 left-0 right-0 h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)} 
          data-sidebar-toggle
          aria-label="Toggle menu"
          className="text-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="font-medium text-center flex-1">
            Bonchef
        </div>
        
        {/* New chat button placeholder */}
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="New chat"
          className="text-gray-700"
          onClick={handleNewChat}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-200 ease-in-out z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div 
        data-sidebar
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="px-4 py-2">
          {user && (
            <div className="mb-6">
              <div className="text-sm mb-2 font-medium">
                {user.email}
              </div>
              <form action={logout}>
                <button 
                  type="submit" 
                  className="text-xs text-blue-500 hover:text-gray-700 transition-colors" 
                  data-testid="logout-button"
                >
                  uitloggen
                </button>
              </form>
            </div>
          )}
          
          <nav className="space-y-4">
            <Link 
              href="/ontdek" 
              className="block text-lg font-medium hover:text-blue-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Ontdek
            </Link>
            
            {user && (
              <Link 
                href="/collection" 
                className="block text-lg font-medium hover:text-blue-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Collectie
              </Link>
            )}
            
            {user && (
              <Link 
                href="/" 
                className="block text-lg font-medium hover:text-blue-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Chat
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  )
} 
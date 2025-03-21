"use client"

import { User } from "@supabase/supabase-js"
import { LogOut, Menu, MessageSquarePlus, Plus, X, Search, LayoutDashboard, User as UserIcon, MessageSquare, BarChart2, FolderOpen, ShoppingCart, Bookmark, Settings } from "lucide-react"
import { logout } from "@/app/actions"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/store/chat-store"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
        {/* Logo and Brand */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="font-bold text-xl flex items-center">
            Bonchef
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="ml-auto text-black hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search Bar */}
        {/* <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[#1D1D27] rounded-md py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </div> */}
        
        {/* Navigation */}
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/ontdek" 
                className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Ontdek</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/collection" 
                className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Bookmark className="h-5 w-5" />
                <span>Collectie</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/" 
                className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {user && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {user.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-700" />
                )}
              </div>
              
              <div className="ml-3">
                {/* TODO: Add name from profile */}
                {/* <div className="text-sm font-medium">
                  {user.user_metadata?.name || user.email?.split('@')[0] || "Web Designer"}
                </div> */}
                <div className="text-sm text-gray-700">
                  {user.email || "user@example.com"}
                </div>
              </div>
              
              <form action={logout} className="ml-auto">
                <button 
                  type="submit" 
                  className="text-gray-700 transition-colors" 
                  data-testid="logout-button"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 
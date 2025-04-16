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
      <div className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)} 
          data-sidebar-toggle
          aria-label="Toggle menu"
          className="text-slate-700 bg-transparent px-2 py-1 rounded-md"
        >
          <Menu data-testid="side-bar-hamburger-menu" className="h-7 w-7" />
        </button>
        
        <div className="flex-1 flex justify-center">
            <Image
              src="/bonchef.png"
              alt="Bonchef"
              width={120}
              height={40}
              className="object-contain"
            />
        </div>
        
        <button 
          type="button"
          aria-label="New chat"
          className="text-slate-700 bg-transparent px-2 py-1 rounded-md"
          onClick={handleNewChat}
          data-testid="reset-chat"
        >
          <MessageSquarePlus className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div 
        data-sidebar
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-xl transition-all duration-300 ease-in-out z-50 rounded-r-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and Brand */}
        <div className="flex items-center p-4 border-b border-slate-200">
            <Image
              src="/bonchef.png"
              alt="Bonchef"
              width={120}
              height={40}
              className="object-contain"
            />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="ml-auto text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-900 hover:text-slate-900 group"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Ontdek</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/collection" 
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-900 hover:text-slate-900 group"
                onClick={() => setIsOpen(false)}
              >
                <Bookmark className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Collectie</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/" 
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-900 hover:text-slate-900 group"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Chat</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          {user ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-sm">
                {user.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-slate-600" />
                )}
              </div>
              
              <div className="ml-3">
                <div className="text-sm text-slate-600">
                  {user.email || "user@example.com"}
                </div>
              </div>
              
              <form action={logout} className="ml-auto">
                <button 
                  type="submit" 
                  className="text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-slate-200 rounded-full" 
                  data-testid="logout-button"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="h-5 w-5" />
              <span>Inloggen</span>
            </Link>
          )}
        </div>
      </div>
    </>
  )
} 
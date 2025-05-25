"use client"

import { LogOut, Menu, MessageSquarePlus, Plus, X, Search, LayoutDashboard, User as UserIcon, MessageSquare, BarChart2, FolderOpen, ShoppingCart, Bookmark, Settings, Download } from "lucide-react"
import { logout } from "@/app/actions"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { cn, createProfileSlug } from "@/lib/utils"
import { useChatStore } from "@/lib/store/chat-store"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useProfile } from "@/hooks/use-profile"
import { ProfileImage } from "@/components/ui/profile-image"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const { clearConversation } = useChatStore()
  const router = useRouter()
  const { profile, isLoading } = useProfile()

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
    router.push("/chat")
    clearConversation()
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
          className="bg-green-700 px-3 py-1 rounded-xl text-white font-medium"
        >
          Menu
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
        
        <motion.button 
          type="button"
          aria-label="New chat"
          className="text-slate-700 bg-transparent px-2 py-1 rounded-md"
          onClick={handleNewChat}
          data-testid="reset-chat"
          whileTap={{ scale: 0.85 }}
          transition={{ duration: 0.15 }}
        >
          <MessageSquarePlus className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300 ease-in-out z-40",
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
              className="w-full bg-[#1D1D27] rounded-md py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-hidden"
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
                <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Importeren</span>
              </Link>
            </li>

            <li>
              <Link 
                href="/chat" 
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
          {profile ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-xs">
                <ProfileImage src={profile.avatar} name={profile.display_name} size={40} />
              </div>
              
              <div className="ml-3">
                <div className="text-sm text-slate-600">
                  {profile && (
                    <Link href={`/profiles/${createProfileSlug(profile.display_name, profile.id)}`} className="hover:underline" onClick={() => setIsOpen(false)}>
                      {profile.display_name || "Anoniem"}
                    </Link>
                  )}
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
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
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
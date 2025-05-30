"use client"

import { Button } from "@/components/ui/button"
import { LogOut, UserIcon } from "lucide-react"
import { cn, createProfileSlug } from "@/lib/utils"
import Image from "next/image";
import { ProfileImage } from "../ui/profile-image"
import { useProfile } from "@/hooks/use-profile";
import { logout } from "@/app/actions"
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import Link from "next/link";

interface TopBarProps {
  children?: React.ReactNode;
  className?: string;
}

export function TopBar({ children, className }: TopBarProps) {
    const { profile } = useProfile()
    const { isVisible } = useScrollDirection()

    const defaultContent = (
        <>
            <Link href="/" className="flex items-center">
                <Image
                    src="/bonchef.png"
                    alt="Bonchef"
                    width={120}
                    height={40}
                    className="object-contain"
                />
            </Link>

            <div className="flex items-center gap-4">
                {profile ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/profiles/${createProfileSlug(
                                profile.display_name,
                                profile.id,
                            )}`}
                            className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-xs"
                        >
                            <ProfileImage
                                src={profile.avatar}
                                name={profile.display_name}
                                size={40}
                            />
                        </Link>
                        <form action={logout}>
                            <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                className="text-slate-600 hover:text-slate-900 transition-colors hover:bg-slate-200 rounded-full"
                                data-testid="logout-button"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors shadow-xs text-sm"
                    >
                        <UserIcon className="h-4 w-4" />
                        <span>Inloggen</span>
                    </Link>
                )}
            </div>
        </>
    )

    return (
        <>
            {/* Fixed positioned bar */}
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200',
                    'transition-transform duration-300 ease-in-out',
                    'safe-area-top',
                    isVisible ? 'translate-y-0' : '-translate-y-full',
                    className
                )}
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                }}
            >
                <div className="px-4 py-3 flex items-center justify-between min-h-[56px]">
                    {children || defaultContent}
                </div>
            </header>
            
            {/* Spacer to prevent content overlap */}
            <div 
                className="topbar-spacer"
                style={{
                    height: 'calc(56px + env(safe-area-inset-top))',
                }}
            />
        </>
    )
}
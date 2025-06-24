"use client"

import { Button } from "@/components/ui/button"
import { LogOut, UserIcon } from "lucide-react"
import { cn, createProfileSlug } from "@/lib/utils"
import Image from "next/image"
import { ProfileImage } from "../ui/profile-image"
import { useProfile } from "@/hooks/use-profile"
import { logout } from "@/app/actions"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import Link from "next/link"
interface TopBarProps {
    children?: React.ReactNode
    className?: string
}

export function TopBar({ children, className }: TopBarProps) {
    const { profile } = useProfile()
    const { isVisible } = useScrollDirection()

    const defaultContent = (
        <>
            <Link href="/" className="flex items-center gap-2">
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
                                profile.id
                            )}`}
                            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300 bg-slate-200 shadow-xs"
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
                                className="text-primary hover:bg-primary/10 rounded-full transition-colors"
                                data-testid="logout-button"
                            >
                                <LogOut className="h-5 w-5" strokeWidth={2.5} />
                            </Button>
                        </form>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white shadow-xs transition-colors"
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
                    "fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white",
                    "transition-transform duration-300 ease-in-out",
                    "safe-area-top",
                    isVisible ? "translate-y-0" : "-translate-y-full",
                    className
                )}
                style={{
                    paddingTop: "env(safe-area-inset-top)",
                }}
            >
                <div className="flex min-h-[56px] items-center justify-between px-4 py-3">
                    {children || defaultContent}
                </div>
            </header>

            {/* Spacer to prevent content overlap */}
            <div
                className="topbar-spacer"
                style={{
                    height: "calc(56px + env(safe-area-inset-top))",
                }}
            />
        </>
    )
}

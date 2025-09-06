"use client"

import { MessageSquarePlus, UserIcon } from "lucide-react"
import { cn, createProfileSlug } from "@/lib/utils"
import Image from "next/image"
import { ProfileImage } from "../ui/profile-image"
import { useProfile } from "@/hooks/use-profile"
import Link from "next/link"

interface TopBarProps {
    children?: React.ReactNode
    className?: string
}

export function TopBar({ children, className }: TopBarProps) {
    const { profile } = useProfile()

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
                            aria-label="Ga naar jouw profiel"
                        >
                            <ProfileImage
                                src={profile.avatar}
                                name={profile.display_name}
                                size={40}
                            />
                        </Link>
                        <Link
                            href="/chat"
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white shadow-xs transition-colors hover:bg-slate-50"
                            aria-label="Ga naar chat"
                        >
                            <MessageSquarePlus className="text-primary h-5 w-5" strokeWidth={2.5} />
                        </Link>
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
        <div className={cn("safe-area-top w-full border-b border-slate-200 bg-white", className)}>
            <div className="flex min-h-[56px] items-center justify-between px-4 py-3">
                {children || defaultContent}
            </div>
        </div>
    )
}

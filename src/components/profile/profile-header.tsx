import { PublicProfile } from "@/lib/types"
import { ProfileImage } from "@/components/ui/profile-image"
import { ClickableText } from "@/components/ui/clickable-text"

interface ProfileHeaderProps {
    profile: PublicProfile
    recipesCount: number
}

export function ProfileHeader({ profile, recipesCount }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <ProfileImage
                src={profile.avatar}
                name={profile.display_name}
                size={96}
                className="border-2 border-gray-200"
            />
            <div className="space-y-2">
                <h1 className="text-2xl font-extrabold">{profile.display_name || "Naamloos"}</h1>
                {profile.bio && (
                    <ClickableText
                        text={profile.bio}
                        className="text-foreground max-w-[22rem] text-sm leading-relaxed"
                    />
                )}
            </div>
            <div className="text-muted-foreground flex gap-4 text-sm">
                <span>
                    <b>{recipesCount}</b> recepten
                </span>
                <span className="text-muted-foreground/50">|</span>
                <span>
                    <b>{profile.total_likes || 0}</b> likes
                </span>
            </div>
            {/* The EditProfileDialog is now triggered from the top-right button on the page itself */}
        </div>
    )
}

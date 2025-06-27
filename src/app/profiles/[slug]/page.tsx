import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PublicProfile, Recipe } from "@/lib/types"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { getPublicProfileByUserId, getPublicRecipesByUserId } from "@/components/profile/actions"
import { createProfileSlug } from "@/lib/utils"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeGridSkeleton } from "@/components/recipe/recipe-grid"
import { ClientBackButton } from "@/components/ui/client-back-button"
import { ShareButton } from "@/components/ui/share-button"
import { EditButton } from "@/components/ui/edit-button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"

interface ProfilePageProps {
    slug: string
}

async function ProfileContent({ profile, recipes }: { profile: PublicProfile; recipes: Recipe[] }) {
    return (
        <div className="flex flex-col space-y-8">
            <div className="container mx-auto max-w-4xl px-4">
                <ProfileHeader profile={profile} recipesCount={recipes.length} />
            </div>

            <Tabs defaultValue="recipes" className="w-full">
                <div className="border-border border-b">
                    <div className="container mx-auto flex max-w-4xl justify-center">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger
                                value="recipes"
                                className="text-muted-foreground data-[state=active]:text-status-green-text after:bg-status-green-text relative rounded-none bg-transparent px-[3.75rem] py-2 text-lg font-bold shadow-none transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100"
                            >
                                Recepten
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>
                <TabsContent value="recipes" className="pt-6">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="grid grid-cols-2 gap-4">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default async function ProfilePage({ params }: { params: Promise<ProfilePageProps> }) {
    const { slug } = await params
    const profile = await getPublicProfileByUserId(slug.split("~")[1])

    if (!profile) {
        notFound()
    }

    const recipes = await getPublicRecipesByUserId(profile.id)

    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    const isOwner = session?.user?.id === profile.id

    return (
        <div className="relative flex flex-1 flex-col space-y-4 pt-16">
            <ClientBackButton />

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {isOwner && (
                    <EditProfileDialog
                        userId={profile.id}
                        initialDisplayName={profile.display_name}
                        initialBio={profile.bio}
                        initialAvatar={profile.avatar}
                    >
                        <EditButton />
                    </EditProfileDialog>
                )}
                <ShareButton
                    shareData={{
                        title: `Bekijk het profiel van ${profile.display_name} op Bonchef`,
                        text: `Gepassioneerde thuiskok die graag nieuwe recepten uitprobeert en deelt.`,
                        url: `/profiles/${createProfileSlug(profile.display_name, profile.id)}`,
                    }}
                />
            </div>

            <Suspense fallback={<RecipeGridSkeleton />}>
                <ProfileContent profile={profile} recipes={recipes} />
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params }: { params: Promise<ProfilePageProps> }) {
    const { slug } = await params
    const profile = await getPublicProfileByUserId(slug.split("~")[1])

    if (!profile) {
        return {
            title: "Profiel niet gevonden",
        }
    }

    return {
        title: `${profile.display_name || "Naamloos"}'s Bonchef Profiel`,
        description:
            profile.bio || "Alle publieke recepten van " + profile.display_name || "Naamloos",
        openGraph: {
            images: profile.avatar
                ? [profile.avatar]
                : [`https://ui-avatars.com/api/?name=${profile.display_name || "X"}`],
            siteName: "Bonchef",
        },
    }
}

export async function generateStaticParams() {
    const supabase = await createAdminClient()

    const { data } = await supabase.from("profiles").select("id, display_name")

    return (
        data?.map((profile) => ({
            slug: createProfileSlug(profile.display_name, profile.id),
        })) || []
    )
}

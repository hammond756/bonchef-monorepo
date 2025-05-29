import { notFound } from "next/navigation";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { RecipeGrid, RecipeGridSkeleton } from "@/components/recipe/recipe-grid";
import { Suspense } from "react";
import { PublicProfile, Recipe } from "@/lib/types";
import { createAdminClient, createClient } from "@/utils/supabase/server";
import { getPublicProfileByUserId, getPublicRecipesByUserId } from "@/components/profile/actions";
import { createProfileSlug } from "@/lib/utils";
import { ProfileImage } from "@/components/ui/profile-image";

interface ProfilePageProps {
  slug: string;
}


async function ProfileContent({ profile, recipes }: { profile: PublicProfile; recipes: Recipe[] }) {
  // Check if current user is the profile owner
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg p-6 shadow-xs mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4 mb-4">
            <ProfileImage src={profile.avatar} name={profile.display_name} size={64} />
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile.display_name || "Naamloos"}
              </h1>
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{recipes.length} recepten</span>
                <span> | </span>
                <span>{profile.total_likes} likes</span>
              </div>
            </div>
          </div>
          {isOwner && (
            <EditProfileDialog
              userId={profile.id}
              initialDisplayName={profile.display_name}
              initialBio={profile.bio}
              initialAvatar={profile.avatar}
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recepten</h2>
        <RecipeGrid recipes={recipes} />
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: {params: Promise<ProfilePageProps>}) {
  const { slug } = await params;
  const profile = await getPublicProfileByUserId(slug.split('~')[1]);
  
  if (!profile) {
    notFound();
  }
  
  const recipes = await getPublicRecipesByUserId(profile.id);

  return (
    <div className="flex flex-1 flex-col px-4 space-y-4 pt-4">
      <Suspense fallback={<RecipeGridSkeleton />}>
        <ProfileContent profile={profile} recipes={recipes} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: {params: Promise<ProfilePageProps>}) {
  const { slug } = await params;
  const profile = await getPublicProfileByUserId(slug.split('~')[1]);
  
  if (!profile) {
    return {
      title: "Profiel niet gevonden",
    };
  }
  
  return {
    title: `${profile.display_name || "Naamloos"}'s Bonchef Profiel`,
    description: profile.bio || "Alle publieke recepten van " + profile.display_name || "Naamloos",
    openGraph: {
      images: profile.avatar ? [profile.avatar] : [`https://ui-avatars.com/api/?name=${profile.display_name || "X"}`],
      siteName: "Bonchef",
    },
  };
} 

export async function generateStaticParams() {
  const supabase = await createAdminClient()
  
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
  
  return data?.map((profile) => ({
    slug: createProfileSlug(profile.display_name, profile.id),
  })) || []
}

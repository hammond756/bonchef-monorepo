import { Alert, AlertDescription } from "./ui/alert";
import { createProfileSlug } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";

export default function ViewProfileAlert() {
    const { profile, isLoading } = useProfile()

    if (isLoading) {
        return null
    }

    if (!profile) {
        return null
    }

    return (
        <Alert variant="default">
            <div className="flex items-center gap-2">
                🎉
                <AlertDescription>
                    Ben je al super trots op je collectie? <Link className="underline text-blue-500" href={`/profiles/${createProfileSlug(profile.display_name, profile.id)}`}>Bekijk je publieke profiel</Link> en deel het met de wereld!
                </AlertDescription>
            </div>
        </Alert>
    )
}
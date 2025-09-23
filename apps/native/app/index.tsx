import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import LoginForm from "@/components/login-form";
import { useSession } from "@/hooks/use-session";

export default function Home() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (hasShareIntent) {
      // we want to handle share intent event in a specific page
      console.debug("[expo-router-index] redirect to ShareIntent screen");
      router.replace({
        pathname: "/share-intent",
      });
    }
  }, [hasShareIntent, router]);

  useEffect(() => {
    if (!isLoading && session) {
      // User is authenticated, redirect to tabs
      console.debug("[expo-router-index] user authenticated, redirecting to tabs");
      router.replace({
        pathname: "/(tabs)/discover",
      });
    }
  }, [session, isLoading, router]);

  // Show login form if no session
  if (!session) {
    return <LoginForm />;
  }
}

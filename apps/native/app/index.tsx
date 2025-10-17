import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import LoginForm from "@/components/login-form";
import { AuthLoading } from "@/components/auth-loading";
import { useAuthContext } from "@/hooks/use-auth-context";
import { onboardingStorage } from "@/lib/utils/mmkv/onboarding";

export default function Home() {
  const router = useRouter();
  const { session, isLoading } = useAuthContext();
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
    if (!isLoading && !hasShareIntent) {
      // Check onboarding status first
      if (!onboardingStorage.hasCompletedOnboarding()) {
        console.debug("[expo-router-index] onboarding not completed, redirecting to onboarding");
        router.replace({
          pathname: "/onboarding",
        });
        return;
      }

      if (session) {
        // User is authenticated, redirect to tabs
        console.debug("[expo-router-index] user authenticated, redirecting to tabs");
        router.replace({
          pathname: "/(tabs)/discover",
        });
      }
    }
  }, [session, isLoading, hasShareIntent, router]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return <AuthLoading />;
  }

  // Show login form if no session
  if (!session) {
    return <LoginForm />;
  }
}

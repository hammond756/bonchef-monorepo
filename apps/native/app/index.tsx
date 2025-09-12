import LoginForm from "@/components/login-form";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { View, ActivityIndicator } from "react-native";

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
  }, [hasShareIntent]);

  useEffect(() => {
    if (!isLoading && session) {
      // User is authenticated, redirect to discover page
      console.debug("[expo-router-index] user authenticated, redirecting to discover");
      router.replace({
        pathname: "/discover",
      });
    }
  }, [session, isLoading, router]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1E4D37" />
      </View>
    );
  }

  // Show login form if no session
  if (!session) {
    return <LoginForm />;
  }
}

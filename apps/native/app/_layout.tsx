import "../global.css";
import { Stack, useRouter } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/providers/auth-provider";

export default function Layout() {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShareIntentProvider
          options={{
            debug: true,
            resetOnBackground: true,
            onResetShareIntent: () =>
              // used when app going in background and when the reset button is pressed
              router.replace({
                pathname: "/",
              }),
          }}
        >
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#000',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              title: "",
              headerBackButtonDisplayMode: "minimal",
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ headerShown: true, headerTransparent: true, headerStyle: { backgroundColor: "transparent" }, headerTintColor: '#000' }} />
            <Stack.Screen name="edit/[id]" options={{ headerShown: true, title: "Recept bewerken" }} />
            <Stack.Screen name="signup" />
            <Stack.Screen name="share-intent" />
          </Stack>
        </ShareIntentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

import "../global.css";
import { Slot, Stack, useRouter } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
              backgroundColor: '#1E4D37',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: "",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ headerTransparent: true, headerStyle: { backgroundColor: "transparent" }, headerTintColor: '#fff' }} />
          <Stack.Screen name="signup" />
          <Stack.Screen name="share-intent" />
        </Stack>
      </ShareIntentProvider>
    </QueryClientProvider>
  );
}

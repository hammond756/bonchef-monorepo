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
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            title: "",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="discover" title="Ontdek" />
          <Stack.Screen name="signup" />
        </Stack>
      </ShareIntentProvider>
    </QueryClientProvider>
  );
}

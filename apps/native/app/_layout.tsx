import "../global.css";
import { Stack, useRouter } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://0bb1c16acdd10603201177166cb085fa@o4509067321016320.ingest.de.sentry.io/4510212204920912',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function Layout() {
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
        <KeyboardProvider>
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
            <GestureHandlerRootView>
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
            </GestureHandlerRootView>
          </ShareIntentProvider>
        </KeyboardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
});

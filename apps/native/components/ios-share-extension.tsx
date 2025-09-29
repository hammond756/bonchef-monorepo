import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { close, type InitialProps } from "expo-share-extension";
import { useState } from "react";
import { View, Text } from "react-native";
import { UrlImportForm } from './import/url-import-form';

export default function IOSShareExtension({ url }: InitialProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  }));

  if (!url) {
    return (
      <View className="w-full h-full items-center justify-center bg-white rounded-2xl">
        <Text>Geen URL gevonden</Text>
      </View>
    );
  }

  return (
    <View className="w-full h-full items-center justify-center bg-white rounded-2xl">
        <QueryClientProvider client={queryClient}>
          <UrlImportForm onClose={close} onBack={close} initialUrl={url} />
        </QueryClientProvider>
    </View>
  );
}

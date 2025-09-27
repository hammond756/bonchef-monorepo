import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { close, type InitialProps } from "expo-share-extension";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { UrlImportForm } from './import/url-import-form';
import { useSession } from '@/hooks/use-session';
import { pendingImportsStorage } from '@/lib/utils/pending-imports';

export default function IOSShareExtension({ url }: InitialProps) {
  const { session, isLoading } = useSession();
  const [hasStoredImport, setHasStoredImport] = useState(false);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  }));

  useEffect(() => {
    if (!isLoading && !session && url) {
      pendingImportsStorage.add({
        type: 'url',
        data: url,
      });
      setHasStoredImport(true);
    }
  }, [session, isLoading, url]);

  if (!url) {
    return (
      <View className="w-full h-full items-center justify-center bg-white rounded-2xl">
        <Text>Geen URL gevonden</Text>
      </View>
    );
  }

  // If no session and we've stored the import, show the not logged in view
  if (!isLoading && !session && hasStoredImport) {
    return (
      <View className="w-full h-full items-center justify-center bg-white rounded-2xl p-6">
        <View className="items-center space-y-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Recept opgeslagen
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            De import wordt gestart zodra je inlogt in de app.
          </Text>
          <TouchableOpacity
            onPress={close}
            className="bg-[#1E4D37] px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold text-base">
              Sluiten
            </Text>
          </TouchableOpacity>
        </View>
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

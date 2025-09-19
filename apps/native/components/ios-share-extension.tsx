import { close, type InitialProps } from "expo-share-extension";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { UrlImportForm } from './import/url-import-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function IOSShareExtension({ url, text }: InitialProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

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
    // Animate in when component mounts
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
  }, []);

  return (
    <Animated.View className="w-full h-full items-center justify-center">
        <QueryClientProvider client={queryClient}>
          <UrlImportForm onClose={close} onBack={close} initialUrl={url} />
        </QueryClientProvider>
    </Animated.View>
  );
}

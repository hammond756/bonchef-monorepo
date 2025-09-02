import { Button, Image, Text, View } from "react-native";

import { useRouter } from "expo-router";
import {
  ShareIntent as ShareIntentType,
  useShareIntentContext,
} from "expo-share-intent";

const WebUrlComponent = ({ shareIntent }: { shareIntent: ShareIntentType }) => {
  return (
    <View
      className="flex-row gap-10 mb-20 border-1 rounded-5 h-102"
    >
      <Image
        source={
          shareIntent.meta?.["og:image"]
            ? { uri: shareIntent.meta?.["og:image"] }
            : undefined
        }
        className="w-100 h-100 rounded-5 mb-20"
      />
      <View className="flex-shrink-1 p-5">
        <Text className="mb-20">
          {shareIntent.meta?.title || "<NO TITLE>"}
        </Text>
        <Text className="mb-20">{shareIntent.webUrl}</Text>
      </View>
    </View>
  );
};

export default function ShareIntent() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, error, resetShareIntent } =
    useShareIntentContext();

  return (
    <View className="flex-1 bg-white items-center justify-center p-10">
      {!hasShareIntent && <Text>No Share intent detected</Text>}
      {hasShareIntent && (
        <Text className="mb-20 text-20">
          Congratz, a share intent value is available
        </Text>
      )}
      {!!shareIntent.text && <Text className="mb-20">{shareIntent.text}</Text>}
      {shareIntent?.type === "weburl" && (
        <WebUrlComponent shareIntent={shareIntent} />
      )}
      {shareIntent?.files?.map((file) => (
        <Image
          key={file.path}
          source={{ uri: file.path }}
          className="w-200 h-200 rounded-5 mb-20"
        />
      ))}
      {hasShareIntent && (
        <Button onPress={() => resetShareIntent()} title="Reset" />
      )}
      <Text className="text-red-500">{error}</Text>
      <Button onPress={() => router.replace("/")} title="Go home" />
    </View>
  );
}

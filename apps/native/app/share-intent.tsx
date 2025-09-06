import { BackHandler, Button, Image, Text, View } from "react-native";

import ImportRecipe from "@/components/import-recipe";
import { useRouter } from "expo-router";
import {
  ShareIntent as ShareIntentType,
  useShareIntentContext,
} from "expo-share-intent";


export default function ShareIntent() {
  const router = useRouter();
  const { shareIntent, error } =
    useShareIntentContext();

  const handleClose = () => {
    // Exit the app on Android (goes back to previous activity). Is a no-op on iOS
    BackHandler.exitApp();
  }

  return (
    <View className="flex-1 bg-white items-center justify-center p-10">
      {shareIntent?.type === "weburl" && shareIntent.webUrl && (
        <ImportRecipe sharedData={{ url: shareIntent.webUrl }} onClose={handleClose} />
      )}
      {shareIntent?.type === "text" && shareIntent.text && (
        <ImportRecipe sharedData={{ text: shareIntent.text }} onClose={handleClose} />
      )}
      <Text className="text-red-500">{error}</Text>
      <Button onPress={() => router.replace("/")} title="Go home" />
      <Button onPress={handleClose} title="Go back" />
    </View>
  );
}

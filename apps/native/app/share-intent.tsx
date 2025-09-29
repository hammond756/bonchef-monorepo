import { useRouter } from "expo-router";
import {
  useShareIntentContext,
} from "expo-share-intent";
import { BackHandler, Button, Text, View } from "react-native";
import { TextImportForm } from "@/components/import/text-import-form";
import { UrlImportForm } from "@/components/import/url-import-form";
import { useCallback } from "react";


export default function ShareIntent() {
  const router = useRouter();
  const { shareIntent, error } = useShareIntentContext();

  const handleClose = useCallback(() => {
    // Exit the app on Android (goes back to previous activity). Is a no-op on iOS
    BackHandler.exitApp();
  }, []);



  return (
    <View className="flex-1 bg-white items-center justify-center p-10">
      {shareIntent?.type === "weburl" && shareIntent.webUrl && (
        <UrlImportForm onClose={handleClose} onBack={handleClose} initialUrl={shareIntent.webUrl} />
      )}
      {shareIntent?.type === "text" && shareIntent.text && (
        <TextImportForm onClose={handleClose} onBack={handleClose} initialText={shareIntent.text} />
      )}
      <Text className="text-red-500">{error}</Text>
      <Button onPress={() => router.replace("/")} title="Go home" />
      <Button onPress={handleClose} title="Go back" />
    </View>
  );
}

import { useRouter } from "expo-router";
import {
  useShareIntentContext,
} from "expo-share-intent";
import { BackHandler, Button, Text, View, TouchableOpacity } from "react-native";
import { TextImportForm } from "@/components/import/text-import-form";
import { UrlImportForm } from "@/components/import/url-import-form";
import { useSession } from "@/hooks/use-session";
import { pendingImportsStorage } from "@/lib/utils/pending-imports";
import { useEffect, useState, useCallback } from "react";


export default function ShareIntent() {
  const router = useRouter();
  const { shareIntent, error } = useShareIntentContext();
  const { session, isLoading } = useSession();
  const [hasStoredImport, setHasStoredImport] = useState(false);

  const handleClose = useCallback(() => {
    // Exit the app on Android (goes back to previous activity). Is a no-op on iOS
    BackHandler.exitApp();
  }, []);

  useEffect(() => {
    if (!isLoading && !session && shareIntent) {
      if (shareIntent.type === "weburl" && shareIntent.webUrl) {
        pendingImportsStorage.add({
          type: 'url',
          data: shareIntent.webUrl,
        });
        setHasStoredImport(true);
      } else if (shareIntent.type === "text" && shareIntent.text) {
        pendingImportsStorage.add({
          type: 'text',
          data: shareIntent.text,
        });
        setHasStoredImport(true);
      }
    }
  }, [session, isLoading, shareIntent]);

  // If no session and we've stored the import, show the not logged in view
  if (!isLoading && !session && hasStoredImport) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <View className="items-center space-y-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Recept opgeslagen
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            De import wordt gestart zodra je inlogt in de app.
          </Text>
          <TouchableOpacity
            onPress={handleClose}
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

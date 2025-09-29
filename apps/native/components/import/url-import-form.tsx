import { useSuccessOverlay } from '@/components/ui/success-overlay';
import { useSession } from '@/hooks/use-session';
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { triggerJob } from '@repo/lib/services/recipe-import-jobs';
import { API_URL } from '@/config/environment';
import { supabase } from '@/lib/utils/supabase/client';
import { offlineImportsStorage } from '@/lib/utils/mmkv/offline-imports';
import { normalizeError } from '@repo/lib/utils/error-handling';
import { useTriggerJob } from '@/hooks/use-trigger-job';

interface UrlImportFormProps {
  onBack: () => void;
  onClose: () => void;
  initialUrl?: string;
}

function isValidUrl(string: string) {
  const pattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return pattern.test(string);
}

function isVerticalVideoUrl(url: string) {
  return /instagram\.com(.*)\/reel\//.test(url) || /tiktok\.com\//.test(url);
}

export function UrlImportForm({ onBack, onClose, initialUrl }: UrlImportFormProps) {
  const [url, setUrl] = useState(initialUrl || '');
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const { triggerSuccess, SuccessOverlayComponent } = useSuccessOverlay();
  const { triggerJobWithOfflineFallback } = useTriggerJob({ supabaseClient: supabase, apiUrl: API_URL || '' });

  const handleUrlSubmit = async () => {
    setError(null);
    setIsLoading(true);

    let urlToSubmit = url.trim();
    if (!urlToSubmit) {
      setError('Voer een URL in.');
      return;
    }

    if (!/^(https?:\/\/)/i.test(urlToSubmit)) {
      urlToSubmit = `https://${urlToSubmit}`;
    }

    if (!isValidUrl(urlToSubmit)) {
      setError('De ingevoerde URL is ongeldig.');
      return;
    }

    const sourceType = isVerticalVideoUrl(urlToSubmit) ? "vertical_video" : "url";
    
    try {
      await triggerJobWithOfflineFallback(sourceType, urlToSubmit);
      triggerSuccess(() => {
          setUrl('');
          onClose();
        });
    } catch {
      setError('Er ging iets mis bij het importeren van het recept. Het is helaas niet duidelijk wat de oorzaak is.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-6 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={onBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Kopieer en plak een URL</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Supported Sources */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="logo-instagram" size={16} color="#E4405F" />
            <Text className="ml-2 text-gray-700">Instagram Reels</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="musical-notes" size={16} color="#000000" />
            <Text className="ml-2 text-gray-700">TikTok&apos;s</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="link" size={16} color="#2563EB" />
            <Text className="ml-2 text-gray-700">Webpagina&apos;s</Text>
          </View>
          
          <Text className="font-semibold text-gray-900 mb-2">Van pagina of video naar recept ✨</Text>
          <Text className="text-gray-600 text-sm">
            Superslim omgezet. Meestal spot-on, soms een gok die je zelf moet checken.
          </Text>
        </View>

        {/* URL Input */}
        <View className="mb-4">
          <TextInput
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setError(null);
            }}
            placeholder="https://website.com/recept"
            className="border border-gray-300 rounded-xl px-4 py-4 text-base"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
          />
          {error && (
            <Text className="text-red-500 text-sm mt-2">{error}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleUrlSubmit}
          disabled={isLoading}
          className={`rounded-xl py-4 px-6 ${
            isLoading ? 'bg-gray-300' : 'bg-green-600'
          }`}
        >
          <Text className="text-white text-center font-medium text-base">
            {isLoading ? 'Importeren...' : 'Importeren'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <SuccessOverlayComponent />
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/utils/supabase/client';

interface UrlImportFormProps {
  onBack: () => void;
  onClose: () => void;
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function isVerticalVideoUrl(url: string) {
  return /instagram\.com(.*)\/reel\//.test(url) || /tiktok\.com\//.test(url);
}

export function UrlImportForm({ onBack, onClose }: UrlImportFormProps) {
  const [url, setUrl] = useState('');
  const { session } = useSession();
  
  const { isLoading, error, setError, handleSubmit } = useRecipeImport({
    supabaseClient: supabase,
    userId: session?.user?.id || '',
  });

  const handleUrlSubmit = async () => {
    setError(null);

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
    
    await handleSubmit(sourceType, urlToSubmit, () => {
      setUrl('');
      onClose();
    });
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
    </View>
  );
}

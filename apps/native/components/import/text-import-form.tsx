import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/utils/supabase/client';
import { useSuccessOverlay } from '@/components/ui/success-overlay';

interface TextImportFormProps {
  onBack: () => void;
  onClose: () => void;
  initialText?: string;
}

export function TextImportForm({ onBack, onClose, initialText }: TextImportFormProps) {
  const [text, setText] = useState(initialText || '');
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  
  const { isLoading, error: triggerError, handleSubmit } = useRecipeImport({
    supabaseClient: supabase,
    userId: session?.user?.id || '',
  });

  const { triggerSuccess, SuccessOverlayComponent } = useSuccessOverlay();

  const handleTextSubmit = async () => {
    setError(null);

    const textToSubmit = text.trim();
    if (!textToSubmit) {
      setError('Voer wat tekst in.');
      return;
    }

    await handleSubmit('text', textToSubmit, () => {
      triggerSuccess(() => {
        setText('');
        onClose();
      });
    });
  };

  return (
    <View className="p-6 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={onBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Importeer van Tekst</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text className="text-gray-600 mb-6">
          Plak de tekst van het recept dat je wilt importeren.
        </Text>

        {/* Text Input */}
        <View className="mb-6 flex-1">
          <TextInput
            value={text}
            onChangeText={(text) => {
              setText(text);
              setError(null);
            }}
            placeholder="Begin hier met het plakken van je recept..."
            className="border border-gray-300 rounded-xl px-4 py-4 text-base flex-1"
            multiline
            textAlignVertical="top"
            editable={!isLoading}
            returnKeyType="default"
            blurOnSubmit={false}
            style={{ 
              minHeight: 120,
              maxHeight: 200,
            }}
          />
          {error && (
            <Text className="text-red-500 text-sm mt-2">{error}</Text>
          )}
          {triggerError && (
            <Text className="text-red-500 text-sm mt-2">{triggerError}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleTextSubmit}
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

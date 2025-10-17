import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImportOptionsProps {
  onSelectMode: (mode: 'url' | 'text' | 'photo' | 'dishcovery') => void;
  onClose: () => void;
}

export function ImportOptions({ onSelectMode, onClose }: ImportOptionsProps) {
  return (
    <View className="p-6 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-gray-900">Recept importeren</Text>
        <TouchableOpacity onPress={() => onSelectMode('url')} className="p-2">
          <Ionicons name="close" size={24} color="#6B7280" onPress={onClose} />
        </TouchableOpacity>
      </View>
      {/* Import Options Grid */}
      <View className="flex-row justify-between mb-6">

        <TouchableOpacity
          onPress={() => onSelectMode('url')}
          className="flex-1 items-center justify-center bg-[#ebffed] rounded-xl p-3 mx-1"
        >
          <Ionicons name="link" size={28} color="#030712" />
          <Text className="text-sm font-light text-gray-950 mt-2">Website</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectMode('text')}
          className="flex-1 items-center justify-center bg-[#ebffed] rounded-xl p-3 mx-1"
        >
          <Ionicons name="document-text" size={28} color="#030712" />
          <Text className="text-sm font-light text-gray-950 mt-2">Notitie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
          onPress={() => onSelectMode('photo')}
          className="flex-1 items-center justify-center bg-orange-100 rounded-xl p-3 mx-1"
        >
          <Ionicons name="scan" size={28} color="#EA580C" />
          <Text className="text-sm font-medium text-orange-800 mt-2">Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectMode('url')}
          className="flex-1 items-center justify-center bg-blue-100 rounded-xl p-3 mx-1"
        >
          <Ionicons name="link" size={28} color="#2563EB" />
          <Text className="text-sm font-medium text-blue-800 mt-2">Website</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectMode('text')}
          className="flex-1 items-center justify-center bg-purple-100 rounded-xl p-3 mx-1"
        >
          <Ionicons name="document-text" size={28} color="#7C3AED" />
          <Text className="text-sm font-medium text-purple-800 mt-2">Notitie</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="relative items-center mb-6">
        <View className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
        <Text className="bg-white px-4 text-sm text-gray-500">of</Text>
      </View>

      {/* Dishcovery Option */}
      <TouchableOpacity
        onPress={() => onSelectMode('dishcovery')}
        className="flex-row items-center justify-center bg-green-100 rounded-xl p-4"
      >
        <Ionicons name="restaurant" size={28} color="#16A34A" />
        <Text className="text-sm font-medium text-green-800 ml-2">Dishcovery</Text>
      </TouchableOpacity>
    </View>
  );
}

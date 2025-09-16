import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoritesCTAProps {
  onDiscoverPress?: () => void;
}

export function FavoritesCTA({ onDiscoverPress }: FavoritesCTAProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* Icon */}
      <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="heart-outline" size={40} color="#EA580C" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
        Nog geen favorieten
      </Text>

      {/* Description */}
      <Text className="text-gray-600 text-center mb-8 leading-6">
        Ontdek lekkere recepten en sla je favorieten op. 
        Je opgeslagen recepten verschijnen hier.
      </Text>

      {/* Discover Button */}
      <TouchableOpacity
        onPress={onDiscoverPress}
        className="bg-orange-600 rounded-xl py-4 px-8 flex-row items-center"
      >
        <Ionicons name="compass-outline" size={20} color="white" />
        <Text className="text-white font-semibold text-base ml-2">
          Ontdek recepten
        </Text>
      </TouchableOpacity>

      {/* Tips */}
      <View className="mt-8 w-full">
        <Text className="text-gray-500 text-sm text-center mb-4">
          Hoe vind je favorieten:
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-2">
              Tik op het bookmark icoon bij recepten
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-2">
              Like recepten die je lekker vindt
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeRead } from '@repo/lib/services/recipes';

interface RecipeCardProps {
  recipe: RecipeRead;
  onPress?: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      style={{ aspectRatio: 1 }}
    >
      {/* Recipe Image */}
      <View className="relative">
        <Image
          source={{ uri: recipe.thumbnail }}
          className="w-full h-32"
          resizeMode="cover"
        />
      </View>

      {/* Recipe Content */}
      <View className="p-3 flex-1">
        <Text 
          className="text-gray-900 font-semibold text-sm mb-1"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

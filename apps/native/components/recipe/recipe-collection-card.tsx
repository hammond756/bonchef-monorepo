import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeRead } from '@repo/lib/services/recipes';
import { RecipeCardBackground } from './recipe-card-background';

interface RecipeCollectionCardProps {
  recipe: RecipeRead;
  onPress?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export function RecipeCollectionCard({ 
  recipe, 
  onPress, 
  onBookmark,
  isBookmarked = false 
}: RecipeCollectionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl overflow-hidden"
      style={{ aspectRatio: 1 }}
    >
      <RecipeCardBackground recipe={recipe} className="flex-1">
        {/* Content Overlay */}
        <View className="absolute right-0 bottom-0 left-0 p-4">
          {/* Recipe Title */}
          <Text 
            className="text font-bold text-white leading-tight font-serif"
            numberOfLines={2}
          >
            {recipe.title}
          </Text>
        </View>

        {/* Bookmark Action */}
        <View className="absolute right-4 top-4">
          <TouchableOpacity
            onPress={onBookmark}
            className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </RecipeCardBackground>
    </TouchableOpacity>
  );
}

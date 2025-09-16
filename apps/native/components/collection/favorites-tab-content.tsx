import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useBookmarkedRecipes } from '@repo/lib/hooks/use-bookmarked-recipes';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/utils/supabase/client';
import { RecipeGrid, CollectionItem } from './recipe-grid';
import { FavoritesCTA } from './favorites-cta';

interface FavoritesTabContentProps {
  sortOrder: 'newest' | 'oldest';
  onRecipePress?: (recipe: any) => void;
  onDiscoverPress?: () => void;
}

export function FavoritesTabContent({ 
  sortOrder, 
  onRecipePress,
  onDiscoverPress 
}: FavoritesTabContentProps) {
  const { session } = useSession();
  const userId = session?.user?.id || '';

  const { recipes: bookmarkedRecipes, isLoading: bookmarkedRecipesLoading } = useBookmarkedRecipes({
    supabaseClient: supabase,
    userId,
  });

  const sortedLikedRecipes = useMemo(() => {
    const sorted = [...(bookmarkedRecipes || [])];
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    return sorted.map((r) => ({ ...r, viewType: "RECIPE" as const }));
  }, [bookmarkedRecipes, sortOrder]);

  if (bookmarkedRecipesLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1E4D37" />
      </View>
    );
  }

  if (sortedLikedRecipes.length === 0) {
    return <FavoritesCTA onDiscoverPress={onDiscoverPress} />;
  }

  return (
    <RecipeGrid 
      items={sortedLikedRecipes}
      onRecipePress={onRecipePress}
    />
  );
}

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CollectionHeader } from '@/components/collection/collection-header';
import { MyRecipes } from '@/components/collection/my-recipes';
import { FavoritesTabContent } from '@/components/collection/favorites-tab-content';

type TabType = 'my-recipes' | 'favorites';
type SortOrder = 'newest' | 'oldest';

export default function Collection() {
  const [activeTab, setActiveTab] = useState<TabType>('my-recipes');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const router = useRouter();

  const handleRecipePress = (recipe: any) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleJobPress = (job: any) => {
    // Handle job press if needed
  };

  const handleRetryJob = (job: any) => {
    // Handle job retry if needed
  };

  const handleImportPress = () => {
    // This will be handled by the floating + button
  };

  const handleDiscoverPress = () => {
    router.push('/discover');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Toggle */}
      <CollectionHeader
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-2 pt-4">
          {activeTab === 'my-recipes' ? (
            <MyRecipes
              sortOrder={sortOrder}
              onRecipePress={handleRecipePress}
              onJobPress={handleJobPress}
              onRetryJob={handleRetryJob}
              onImportPress={handleImportPress}
            />
          ) : (
            <FavoritesTabContent
              sortOrder={sortOrder}
              onRecipePress={handleRecipePress}
              onDiscoverPress={handleDiscoverPress}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyRecipes } from '@/components/collection/my-recipes';
import { FavoritesTabContent } from '@/components/collection/favorites-tab-content';
import { useRouter } from 'expo-router';

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
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Collectie</Text>
        
        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('my-recipes')}
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'my-recipes' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'my-recipes' ? 'text-gray-900' : 'text-gray-600'
            }`}>
              Eigen recepten
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'favorites' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'favorites' ? 'text-gray-900' : 'text-gray-600'
            }`}>
              Favorieten
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Order */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="funnel-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-2">Sorteren:</Text>
          </View>
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setSortOrder('newest')}
              className={`py-1 px-3 rounded ${
                sortOrder === 'newest' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text className={`text-xs font-medium ${
                sortOrder === 'newest' ? 'text-gray-900' : 'text-gray-600'
              }`}>
                Nieuwste
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortOrder('oldest')}
              className={`py-1 px-3 rounded ${
                sortOrder === 'oldest' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text className={`text-xs font-medium ${
                sortOrder === 'oldest' ? 'text-gray-900' : 'text-gray-600'
              }`}>
                Oudste
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
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

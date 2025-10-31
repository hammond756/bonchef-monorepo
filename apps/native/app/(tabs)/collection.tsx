import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { CollectionHeader } from '@/components/collection/collection-header';
import { MyRecipes } from '@/components/collection/my-recipes';
import { useOfflineImports } from '@/hooks/use-offline-imports';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type SortOrder = 'newest' | 'oldest';

export default function Collection() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { processOfflineImports, offlineCount, isProcessing } = useOfflineImports();

  const handleProcessOfflineImports = async () => {
    await processOfflineImports();
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Verzameling",
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleSortToggle}
              className="bg-green-secondary px-3 py-1 rounded-full flex-row items-center ml-2"
            >
              <Text className="text-gray-950 text-sm font-medium font-montserrat mr-1">
                {sortOrder === 'newest' ? 'Nieuwste' : 'Oudste'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#030712" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-white">
        {/* Header with Offline Button */}
        {offlineCount > 0 && <CollectionHeader
          offlineCount={offlineCount}
          onProcessOfflineImports={handleProcessOfflineImports}
          isProcessing={isProcessing}
        />}

        {/* Content */}
        <View className="px-2 pt-4">
          <MyRecipes
                sortOrder={sortOrder}
              />
        </View>
      </View>
    </>
  );
}
import { useState } from 'react';
import { View } from 'react-native';
import { CollectionHeader } from '@/components/collection/collection-header';
import { MyRecipes } from '@/components/collection/my-recipes';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useOfflineImports } from '@/components/offline-imports-handler';

type SortOrder = 'newest' | 'oldest';

export default function Collection() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const tabBarHeight = useBottomTabBarHeight();
  const { processOfflineImports, offlineCount, isProcessing } = useOfflineImports();

  const handleProcessOfflineImports = async () => {
    await processOfflineImports();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Toggle */}
      <CollectionHeader
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        offlineCount={offlineCount}
        onProcessOfflineImports={handleProcessOfflineImports}
        isProcessing={isProcessing}
      />

      {/* Content */}
      <View className="px-2 pt-4" style={{ paddingBottom: tabBarHeight - 34 }}>
        <MyRecipes
              sortOrder={sortOrder}
            />
      </View>
    </View>
  );
}
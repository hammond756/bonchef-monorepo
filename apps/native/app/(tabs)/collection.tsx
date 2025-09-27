import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { CollectionHeader } from '@/components/collection/collection-header';
import { MyRecipes } from '@/components/collection/my-recipes';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { usePendingImports } from '@/components/pending-imports-handler';

type SortOrder = 'newest' | 'oldest';

export default function Collection() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const tabBarHeight = useBottomTabBarHeight();
  const { processPendingImports, getPendingImportsCount, isProcessing } = usePendingImports();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const count = getPendingImportsCount();
    setPendingCount(count);
  }, [getPendingImportsCount]);

  useEffect(() => {
    if (!isProcessing) {
      const count = getPendingImportsCount();
      setPendingCount(count);
    }
  }, [isProcessing, getPendingImportsCount]);

  const handleProcessPendingImports = async () => {
    await processPendingImports();
    const newCount = getPendingImportsCount();
    setPendingCount(newCount);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Toggle */}
      <CollectionHeader
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        pendingCount={pendingCount}
        onProcessPendingImports={handleProcessPendingImports}
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
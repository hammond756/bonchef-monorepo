import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CollectionHeader } from '@/components/collection/collection-header';
import { MyRecipes } from '@/components/collection/my-recipes';

type SortOrder = 'newest' | 'oldest';

export default function Collection() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Toggle */}
      <CollectionHeader
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Content */}
      <View className="px-2 pt-4">
        <MyRecipes
              sortOrder={sortOrder}
            />
      </View>
    </View>
  );
}
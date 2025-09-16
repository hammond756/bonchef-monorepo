import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SortOrder = 'newest' | 'oldest';

interface CollectionHeaderProps {
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
}

export function CollectionHeader({ 
  sortOrder, 
  onSortChange 
}: CollectionHeaderProps) {

  return (
    <View className="bg-white px-4 pt-4 pb-2">      
      {/* Sort Order and View Options */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="bg-green-100 px-3 py-1 rounded-full flex-row items-center"
          >
            <Text className="text-green-700 text-sm font-medium mr-1">
              {sortOrder === 'newest' ? 'Nieuwste' : 'Oudste'}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#15803d" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

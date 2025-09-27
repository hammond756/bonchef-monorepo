import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SortOrder = 'newest' | 'oldest';

interface CollectionHeaderProps {
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  pendingCount: number;
  onProcessPendingImports: () => void;
  isProcessing: boolean;
}

export function CollectionHeader({ 
  sortOrder, 
  onSortChange,
  pendingCount,
  onProcessPendingImports,
  isProcessing
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
        
        {/* Pending Imports Button */}
        {pendingCount > 0 && <TouchableOpacity
          onPress={onProcessPendingImports}
          disabled={isProcessing || pendingCount === 0}
          className={`px-3 py-1 rounded-full flex-row items-center ${
            isProcessing || pendingCount === 0 
              ? 'bg-gray-400' 
              : 'bg-[#1E4D37]'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator size={14} color="white" />
          ) : (
            <Ionicons name="download-outline" size={14} color="white" />
          )}
          <Text className="text-white text-sm font-medium ml-1">
            {isProcessing ? 'Verwerken...' : `${pendingCount} wachten`}
          </Text>
        </TouchableOpacity>}
      </View>
    </View>
  );
}

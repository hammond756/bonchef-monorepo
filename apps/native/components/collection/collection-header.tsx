import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CollectionHeaderProps {
  offlineCount: number;
  onProcessOfflineImports: () => void;
  isProcessing: boolean;
}

export function CollectionHeader({ 
  offlineCount,
  onProcessOfflineImports,
  isProcessing
}: CollectionHeaderProps) {

  return (
    <View className="bg-white px-4 pt-4 pb-2">      
      {/* Offline Imports Button - Only show when there are offline imports to process */}
      {offlineCount > 0 && (
        <View className="flex-row items-center justify-end">
          <TouchableOpacity
            onPress={onProcessOfflineImports}
            disabled={isProcessing}
            className={`px-3 py-1 rounded-full flex-row items-center ${
              isProcessing 
                ? 'bg-gray-400' 
                : 'bg-green-600'
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator size={14} color="white" />
            ) : (
              <Ionicons name="download-outline" size={14} color="white" />
            )}
            <Text className="text-white text-sm font-medium ml-1">
              {isProcessing ? 'Verwerken...' : `${offlineCount} nog te verwerken`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import type { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface FailedJobCardProps {
  job: NonCompletedRecipeImportJob;
}

export function FailedJobCard({ job }: FailedJobCardProps) {
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'url':
        return 'link-outline';
      case 'text':
        return 'document-text-outline';
      case 'image':
        return 'camera-outline';
      case 'vertical_video':
        return 'videocam-outline';
      case 'dishcovery':
        return 'restaurant-outline';
      default:
        return 'add-outline';
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'url':
        return 'Website';
      case 'text':
        return 'Tekst';
      case 'image':
        return 'Foto';
      case 'vertical_video':
        return 'Video';
      case 'dishcovery':
        return 'Dishcovery';
      default:
        return 'Import';
    }
  };

  return (
    <View className="flex-1 p-4 flex flex-col justify-center items-center border border-red-200 rounded-xl aspect-[3/4]">
        {/* Error Icon */}
        <View className="items-center mb-3">
          <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          </View>
        </View>

        {/* Error Message */}
        <Text 
          className="text-gray-700 text-xs mb-3"
          numberOfLines={3}
        >
          {job.error_message || 'Er ging iets mis bij het importeren'}
        </Text>

        {/* Source Preview */}
        <View className="px-2 py-1 bg-gray-50 rounded mb-3">
          <Text 
            className="text-gray-600 text-xs"
            numberOfLines={2}
          >
            {job.source_data.length > 40 
              ? `${job.source_data.substring(0, 40)}...` 
              : job.source_data
            }
          </Text>
        </View>
      </View>
  );
}

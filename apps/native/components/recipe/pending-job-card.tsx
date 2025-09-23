import { Ionicons } from '@expo/vector-icons';
import type { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface PendingJobCardProps {
  job: NonCompletedRecipeImportJob;
}

export function PendingJobCard({ job }: PendingJobCardProps) {
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
    <Pressable
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      style={{ aspectRatio: 0.75 }}
    >
      <View className="flex-1 relative">
        {/* Background Pattern */}
        <View className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
        
        {/* Decorative Pattern */}
        <View className="absolute top-4 right-4 w-16 h-16 bg-green-100 rounded-full opacity-20" />
        <View className="absolute bottom-8 left-4 w-8 h-8 bg-emerald-100 rounded-full opacity-30" />
        
        {/* Content */}
        <View className="flex-1 p-6 flex flex-col justify-center items-center">
          {/* Loading Indicator */}
          <View className="mb-4">
            <ActivityIndicator size="large" color="#1E4D37" />
          </View>
          
          {/* Source Icon */}
          <View className="mb-4">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center shadow-sm">
              <Ionicons 
                name={getSourceIcon(job.source_type)} 
                size={32} 
                color="#1E4D37" 
              />
            </View>
          </View>

          {/* Status Text */}
          <Text className="text-gray-900 font-semibold text-sm mb-2 text-center">
            {getSourceLabel(job.source_type)} importeren
          </Text>
          
          <Text className="text-gray-600 text-xs text-center mb-4 leading-relaxed">
            Je recept wordt verwerkt...
          </Text>

          {/* Source Preview */}
          <View className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl w-full shadow-sm">
            <Text 
              className="text-gray-700 text-xs text-center leading-relaxed"
              numberOfLines={2}
            >
              {job.source_data.length > 50 
                ? `${job.source_data.substring(0, 50)}...` 
                : job.source_data
              }
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

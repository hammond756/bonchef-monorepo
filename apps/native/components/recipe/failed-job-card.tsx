import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';

interface FailedJobCardProps {
  job: NonCompletedRecipeImportJob;
  onPress?: () => void;
  onRetry?: () => void;
}

export function FailedJobCard({ job, onPress, onRetry }: FailedJobCardProps) {
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
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden"
      style={{ aspectRatio: 1 }}
    >
      <View className="flex-1 p-4">
        {/* Error Icon */}
        <View className="items-center mb-3">
          <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          </View>
          
          <Text className="text-red-600 font-semibold text-sm mb-1">
            Import mislukt
          </Text>
        </View>

        {/* Source Info */}
        <View className="flex-row items-center mb-2">
          <Ionicons 
            name={getSourceIcon(job.source_type)} 
            size={16} 
            color="#6B7280" 
          />
          <Text className="text-gray-600 text-xs ml-2">
            {getSourceLabel(job.source_type)}
          </Text>
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

        {/* Retry Button */}
        <TouchableOpacity
          onPress={onRetry}
          className="bg-red-50 border border-red-200 rounded-lg py-2 px-3"
        >
          <Text className="text-red-600 text-xs font-medium text-center">
            Opnieuw proberen
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

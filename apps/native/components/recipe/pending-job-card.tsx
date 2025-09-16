import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';

interface PendingJobCardProps {
  job: NonCompletedRecipeImportJob;
  onPress?: () => void;
}

export function PendingJobCard({ job, onPress }: PendingJobCardProps) {
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      style={{ aspectRatio: 1 }}
    >
      <View className="flex-1 items-center justify-center p-4">
        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#1E4D37" />
        
        {/* Source Icon */}
        <View className="mt-4 mb-2">
          <Ionicons 
            name={getSourceIcon(job.source_type)} 
            size={32} 
            color="#1E4D37" 
          />
        </View>

        {/* Status Text */}
        <Text className="text-gray-900 font-semibold text-sm mb-1">
          {getSourceLabel(job.source_type)} importeren
        </Text>
        
        <Text className="text-gray-600 text-xs text-center">
          Je recept wordt verwerkt...
        </Text>

        {/* Source Preview */}
        <View className="mt-3 px-3 py-2 bg-gray-50 rounded-lg w-full">
          <Text 
            className="text-gray-700 text-xs text-center"
            numberOfLines={2}
          >
            {job.source_data.length > 50 
              ? `${job.source_data.substring(0, 50)}...` 
              : job.source_data
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

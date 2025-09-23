import { Ionicons } from '@expo/vector-icons';
import type { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';
import { Pressable, Text, View } from 'react-native';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/utils/supabase/client';

interface FailedJobCardProps {
  job: NonCompletedRecipeImportJob;
}

export function FailedJobCard({ job }: FailedJobCardProps) {
  const { session } = useSession();
  const userId = session?.user?.id || '';
  
  const { deleteJob, isDeleting } = useRecipeImport({
    supabaseClient: supabase,
    userId,
  });
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
        <View className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50" />
        
        {/* Decorative Pattern */}
        <View className="absolute top-4 right-4 w-16 h-16 bg-red-100 rounded-full opacity-20" />
        <View className="absolute bottom-8 left-4 w-8 h-8 bg-orange-100 rounded-full opacity-30" />
        
        {/* Delete Button */}
        <Pressable
          onPress={() => deleteJob(job.id)}
          disabled={isDeleting}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-sm z-10"
          style={{ opacity: isDeleting ? 0.5 : 1 }}
        >
          <Ionicons 
            name="close" 
            size={16} 
            color="#EF4444" 
          />
        </Pressable>
        
        {/* Content */}
        <View className="flex-1 p-6 flex flex-col justify-center items-center">
          {/* Error Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3 shadow-sm">
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            </View>
          </View>

          {/* Error Message */}
          <Text 
            className="text-gray-800 text-sm font-medium mb-4 text-center leading-relaxed"
            numberOfLines={3}
          >
            {job.error_message || 'Er ging iets mis bij het importeren'}
          </Text>

          {/* Source Type Badge */}
          <View className="px-3 py-1 bg-white rounded-full shadow-sm mb-4">
            <View className="flex-row items-center">
              <Ionicons 
                name={getSourceIcon(job.source_type)} 
                size={14} 
                color="#6B7280" 
                style={{ marginRight: 4 }}
              />
              <Text className="text-gray-600 text-xs font-medium">
                {getSourceLabel(job.source_type)}
              </Text>
            </View>
          </View>

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

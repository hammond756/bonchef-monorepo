import React from 'react';
import { View, FlatList } from 'react-native';
import { RecipeCollectionCard } from '../recipe/recipe-collection-card';
import { PendingJobCard } from '../recipe/pending-job-card';
import { FailedJobCard } from '../recipe/failed-job-card';
import { NonCompletedRecipeImportJob } from '@repo/lib/services/recipe-import-jobs';
import { RecipeRead } from '@repo/lib/services/recipes';

// A union type for items that can be displayed in the collection grid
export type CollectionItem =
  | (RecipeRead & { viewType: "RECIPE" })
  | (NonCompletedRecipeImportJob & { viewType: "JOB" });

interface RecipeGridProps {
  items: Readonly<CollectionItem[]>;
  onRecipePress?: (recipe: RecipeRead) => void;
  onJobPress?: (job: NonCompletedRecipeImportJob) => void;
  onRetryJob?: (job: NonCompletedRecipeImportJob) => void;
}

export function RecipeGrid({ 
  items, 
  onRecipePress, 
  onJobPress, 
  onRetryJob 
}: RecipeGridProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: CollectionItem }) => {
    if (item.viewType === "RECIPE") {
      return (
        <View className="flex-1 p-1">
          <RecipeCollectionCard 
            recipe={item} 
            onPress={() => onRecipePress?.(item)} 
          />
        </View>
      );
    } else if (item.status === "failed") {
      return (
        <View className="flex-1 p-1">
          <FailedJobCard 
            job={item} 
            onPress={() => onJobPress?.(item)}
            onRetry={() => onRetryJob?.(item)}
          />
        </View>
      );
    } else {
      return (
        <View className="flex-1 p-1">
          <PendingJobCard 
            job={item} 
            onPress={() => onJobPress?.(item)} 
          />
        </View>
      );
    }
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      numColumns={2}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

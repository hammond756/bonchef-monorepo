import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { RecipeCollectionCard } from '../recipe/recipe-collection-card';
import { PendingJobCard } from '../recipe/pending-job-card';
import { FailedJobCard } from '../recipe/failed-job-card';
import type { NonCompletedRecipeImportJob } from "@repo/lib/services/recipe-import-jobs";
import type { RecipeDetail } from "@repo/lib/services/recipes";

// A union type for items that can be displayed in the collection grid
export type CollectionItem =
  | (RecipeDetail & { viewType: "RECIPE" })
  | (NonCompletedRecipeImportJob & { viewType: "JOB" });

interface RecipeGridProps {
  items: readonly CollectionItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

export function RecipeGrid({ 
  items,
  onLoadMore,
  hasMore,
  onRefresh,
  isLoading,
  isRefreshing,
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
          />
        </View>
      );
    } else if (item.status === "failed") {
      return (
        <View className="flex-1 p-1">
          <FailedJobCard 
            job={item}
          />
        </View>
      );
    } else {
      return (
        <View className="flex-1 p-1">
          <PendingJobCard 
            job={item} 
          />
        </View>
      );
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
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
      onEndReached={handleLoadMore}
      onEndReachedThreshold={1.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing || false} onRefresh={handleRefresh} />
        ) : undefined
      }
      ListFooterComponent={
        hasMore && isLoading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#1E4D37" />
          </View>
        ) : null
      }
    />
  );
}

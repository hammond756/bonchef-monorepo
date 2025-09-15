import { usePublicRecipes } from "@repo/lib/hooks/use-public-recipes";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { RecipeFeedCard } from "../../components/recipe";
import { RecipeRead } from "@repo/lib";
import { supabase } from "@/lib/utils/supabase/client";

const Feed = () => {
  const { recipes, isLoading, hasMore, loadMore, error, mutate } = usePublicRecipes(supabase);

  const renderRecipe = ({ item }: { item: RecipeRead }) => (
    <RecipeFeedCard recipe={item} />
  );

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    mutate();
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center">
          Error loading recipes: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      renderItem={renderRecipe}
      keyExtractor={(item) => item.id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
    />
  );
};

export default function Discover() {
  return (
    <View className="flex-1 bg-white">
      <Feed />
    </View>
  );
}

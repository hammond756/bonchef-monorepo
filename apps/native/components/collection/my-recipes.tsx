import { useOwnRecipes } from '@repo/lib/hooks/use-own-recipes';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/utils/supabase/client';
import { RecipeGrid } from './recipe-grid';
import { WelcomeSection } from './welcome-section';

interface MyRecipesProps {
  sortOrder: 'newest' | 'oldest';
}

export function MyRecipes({ 
  sortOrder,
}: MyRecipesProps) {
  const { session } = useAuthContext();
  const userId = session?.user?.id || '';

  const { 
    recipes: userRecipes, 
    isLoading: userRecipesLoading,
    isFetchingNextPage,
    isFetching,
    hasMore,
    loadMore,
    mutate,
    error 
  } = useOwnRecipes({
    supabaseClient: supabase,
    userId,
  });

  const { jobs, isLoading: importJobsLoading } = useRecipeImport({
    supabaseClient: supabase,
    userId,
  });

  const myRecipesAndJobs = useMemo(() => {
    // Failed jobs first, then pending jobs, then recipes
    const failedJobs = jobs
      .filter((job) => job.status === "failed")
      .map((job) => ({ ...job, viewType: "JOB" as const }));

    const pendingJobs = jobs
      .filter((job) => job.status === "pending")
      .map((job) => ({ ...job, viewType: "JOB" as const }));

    const recipes = userRecipes.map((recipe) => ({ ...recipe, viewType: "RECIPE" as const }));

    const allCards = [...failedJobs, ...pendingJobs, ...recipes];

    return allCards.sort((a, b) => {
      const dateA = new Date(a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [jobs, userRecipes, sortOrder]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center">
          Error loading recipes: {error.message}
        </Text>
      </View>
    );
  }

  if (userRecipesLoading || importJobsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1E4D37" />
      </View>
    );
  }

  if (myRecipesAndJobs.length === 0) {
    return <WelcomeSection />;
  }

  return (
    <RecipeGrid 
      items={myRecipesAndJobs}
      onLoadMore={loadMore}
      hasMore={hasMore}
      onRefresh={mutate}
      isLoading={isFetchingNextPage}
      isRefreshing={isFetching && !isFetchingNextPage}
    />
  );
}

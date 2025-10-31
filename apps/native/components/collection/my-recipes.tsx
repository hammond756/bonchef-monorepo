import { API_URL } from '@/config/environment';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/utils/supabase/client';
import { useFocusEffect } from '@react-navigation/native';
import { useOwnRecipes } from '@repo/lib/hooks/use-own-recipes';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, AppState, Text, View, type AppStateStatus } from 'react-native';
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

  const { jobs, isLoading: importJobsLoading, refreshJobs } = useRecipeImport({
    supabaseClient: supabase,
    userId,
    apiUrl: API_URL || "",
  });

  // Refetch jobs when the screen comes into focus (navigation between tabs)
  // This ensures we pick up jobs created elsewhere (web app, share extension, etc.)
  useFocusEffect(
    useCallback(() => {
      refreshJobs();
    }, [refreshJobs])
  );

  // Refetch jobs when app becomes active (app opens, returns from background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshJobs();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshJobs]);

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

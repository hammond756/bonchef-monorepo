import { useInfiniteQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import { getUserRecipesWithClient, type RecipeDetail } from "../services/recipes";

const PAGE_SIZE = 12;

export interface UseOwnRecipesOptions {
  supabaseClient: SupabaseClient;
  userId: string | null;
}

export interface UseOwnRecipesReturn {
  recipes: RecipeDetail[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  count: () => number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  mutate: () => void;
}

/**
 * Hook for fetching user's own recipes with pagination
 * @param options - Configuration options including Supabase client and user ID
 * @returns User's recipes data and functions
 */
export function useOwnRecipes({ 
  supabaseClient, 
  userId 
}: UseOwnRecipesOptions): UseOwnRecipesReturn {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["own-recipes", userId],
    queryFn: ({ pageParam = 1 }) => {
      return getUserRecipesWithClient(supabaseClient, userId, {
        page: pageParam,
        pageSize: PAGE_SIZE,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalCount = lastPage?.count || 0;
      const currentCount = allPages.reduce((acc, page) => acc + (page?.data?.length || 0), 0);
      return currentCount < totalCount ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recipes = data?.pages.flatMap((page) => page?.data || []) || [];
  const hasMore = hasNextPage && !error;

  const loadMore = useCallback(async () => {
    if (isFetching || isFetchingNextPage) return;
    await fetchNextPage();
  }, [fetchNextPage, isFetching, isFetchingNextPage]);

  const count = () => {
    if (!userId) {
      return 0;
    }
    return recipes?.length || 0;
  };

  return {
    recipes,
    isLoading,
    isFetchingNextPage,
    isFetching,
    error: error as Error | null,
    refetch,
    count,
    hasMore,
    loadMore,
    mutate: refetch,
  };
}

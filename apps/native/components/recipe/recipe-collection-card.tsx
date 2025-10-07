import type { RecipeDetail } from '@repo/lib/services/recipes';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { RecipeCardBackground } from './recipe-card-background';

interface RecipeCollectionCardProps {
  recipe: RecipeDetail;
}

export function RecipeCollectionCard({ 
  recipe,
}: RecipeCollectionCardProps) {
  const router = useRouter()
  const handleRecipePress = () => {
    if (recipe.status === "DRAFT") {
      router.push(`/edit/${recipe.id}`)
      return
    }
    router.push(`/recipe/${recipe.id}`)
  }
  return (
    <Pressable
      onPress={handleRecipePress}
      className="rounded-2xl overflow-hidden"
      style={{ aspectRatio: 0.75 }}
    >
      <RecipeCardBackground recipe={recipe} className="flex-1" blur={recipe.status === "DRAFT"}>
        {/* Concept Badge for Draft Recipes */}
        {recipe.status === "DRAFT" && (
          <View className="absolute top-3 right-3 bg-[#fff9d9] border-[#ffeeaa] text-[#8a5a00] px-2 py-1 rounded-full">
            <Text className="text-sm font-semibold text-black">
              Concept
            </Text>
          </View>
        )}
        
        {/* Content Overlay */}
        <View className="absolute right-0 bottom-0 left-0 p-4">
          {/* Recipe Title */}
          <Text 
            className="text font-bold text-white leading-tight font-serif"
            numberOfLines={2}
          >
            {recipe.title}
          </Text>
        </View>
      </RecipeCardBackground>
    </Pressable>
  );
}

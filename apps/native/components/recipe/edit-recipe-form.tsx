import { ScrollView, View, Text } from 'react-native'
import { useFormContext } from 'react-hook-form'
import { RecipeInformationSection } from './recipe-information-section'
import { IngredientsList } from './ingredients-list'
import { InstructionsList } from './instructions-list'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

export function EditRecipeForm() {
  const { watch, formState } = useFormContext<RecipeUpdate>()
  const { errors } = formState
  
  // Watch all form values
  const recipe = watch()

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          {/* Recipe Information Section */}
          <RecipeInformationSection />

          {/* Ingredients Section */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold">Ingrediënten</Text>
            <IngredientsList
              ingredients={recipe.ingredients}
              errors={errors}
            />
          </View>

          {/* Instructions Section */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold">Bereidingswijze</Text>
            <InstructionsList
              instructions={recipe.instructions}
              errors={errors}
            />
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>
    </View>
  )
}
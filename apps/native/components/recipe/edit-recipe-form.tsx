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
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Recipe Information Section */}
          <View className="mb-6">
            <RecipeInformationSection />
          </View>

          {/* Ingredients Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 font-serif">Ingrediënten</Text>
            <IngredientsList
              ingredients={recipe.ingredients}
              errors={errors}
            />
          </View>

          {/* Instructions Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 font-serif">Bereidingswijze</Text>
            <InstructionsList
              instructions={recipe.instructions}
              errors={errors}
            />
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>
    </View>
  )
}
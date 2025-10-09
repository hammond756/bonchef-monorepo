import { View, Text } from 'react-native'
import { useFormContext } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
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
      <KeyboardAwareScrollView 
        bottomOffset={63}
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-6">
          {/* Recipe Information Section */}
          <View>
            <RecipeInformationSection />
          </View>

          {/* Ingredients Section */}
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-4 font-serif">Ingrediënten</Text>
            <IngredientsList
              ingredients={recipe.ingredients}
              errors={errors}
            />
          </View>

          {/* Instructions Section */}
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-4 font-serif">Bereidingswijze</Text>
            <InstructionsList
              instructions={recipe.instructions}
              errors={errors}
            />
          </View>

          <View className="h-24" />
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}
import { ScrollView, View, Text } from 'react-native'
import { useRecipeEditContext } from './recipe-edit-context'
import { RecipeInformationSection } from './recipe-information-section'
import { IngredientsList } from './ingredients-list'
import { InstructionsList } from './instructions-list'

interface EditRecipeFormProps {
  isOnboardingFlow?: boolean
  onBack: () => void
}

export function EditRecipeForm({
  isOnboardingFlow: _isOnboardingFlow = false,
  onBack: _onBack,
}: EditRecipeFormProps) {
  const {
    recipe: currentRecipe,
    errors,
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
  } = useRecipeEditContext()

  const handleImageChange = (uri: string) => {
    setImageUrl(uri)
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          {/* Recipe Information Section */}
          <RecipeInformationSection
            imageUrl={currentRecipe.thumbnail}
            onImageChange={handleImageChange}
            title={currentRecipe.title}
            onTitleChange={(title) => updateField('title', title)}
            cookingTime={currentRecipe.total_cook_time_minutes}
            onCookingTimeChange={(time) => updateField('total_cook_time_minutes', time)}
            servings={currentRecipe.n_portions}
            onServingsChange={(servings) => updateField('n_portions', servings)}
            description={currentRecipe.description || ''}
            onDescriptionChange={(description) => updateField('description', description)}
            source={currentRecipe.source_name || ''}
            onSourceChange={(source) => updateField('source_name', source)}
            sourceUrl={currentRecipe.source_url || ''}
            onSourceUrlChange={(sourceUrl) => updateField('source_url', sourceUrl)}
            errors={errors}
          />

          {/* Ingredients Section */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Ingrediënten</Text>
            <IngredientsList
              ingredients={currentRecipe.ingredients}
              onIngredientsChange={updateIngredients}
              errors={errors}
            />
          </View>

          {/* Instructions Section */}
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Bereiding</Text>
            <InstructionsList
              instructions={currentRecipe.instructions}
              onInstructionsChange={updateInstructions}
              errors={errors}
            />
          </View>

          {/* Bottom spacing for scroll */}
          <View className="h-20" />
        </View>
      </ScrollView>
    </View>
  )
}

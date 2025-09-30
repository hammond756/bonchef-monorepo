import { View, Text, TextInput } from 'react-native'
import { useFormContext } from 'react-hook-form'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

type Ingredient = {
  quantity: {
    type: "range"
    low: number
    high: number
  }
  unit: string
  description: string
}

type IngredientGroup = {
  name: string
  ingredients: Ingredient[]
}

interface IngredientsListProps {
  ingredients: IngredientGroup[]
  errors?: Record<string, { message?: string }>
}

export function IngredientsList({
  ingredients,
  errors,
}: IngredientsListProps) {
  const { setValue, watch } = useFormContext<RecipeUpdate>()
  const watchedIngredients = watch('ingredients')

  const handleGroupNameChange = (groupIndex: number, name: string) => {
    const updatedIngredients = [...watchedIngredients]
    updatedIngredients[groupIndex] = { ...updatedIngredients[groupIndex], name }
    setValue('ingredients', updatedIngredients, { shouldDirty: true })
  }

  const handleIngredientQuantityChange = (groupIndex: number, ingredientIndex: number, quantity: number) => {
    const updatedIngredients = [...watchedIngredients]
    updatedIngredients[groupIndex] = {
      ...updatedIngredients[groupIndex],
      ingredients: updatedIngredients[groupIndex].ingredients.map((ingredient: Ingredient, idx: number) =>
        idx === ingredientIndex
          ? { ...ingredient, quantity: { ...ingredient.quantity, low: quantity, high: quantity } }
          : ingredient
      )
    }
    setValue('ingredients', updatedIngredients, { shouldDirty: true })
  }

  const handleIngredientUnitChange = (groupIndex: number, ingredientIndex: number, unit: string) => {
    const updatedIngredients = [...watchedIngredients]
    updatedIngredients[groupIndex] = {
      ...updatedIngredients[groupIndex],
      ingredients: updatedIngredients[groupIndex].ingredients.map((ingredient: Ingredient, idx: number) =>
        idx === ingredientIndex
          ? { ...ingredient, unit }
          : ingredient
      )
    }
    setValue('ingredients', updatedIngredients, { shouldDirty: true })
  }

  const handleIngredientDescriptionChange = (groupIndex: number, ingredientIndex: number, description: string) => {
    const updatedIngredients = [...watchedIngredients]
    updatedIngredients[groupIndex] = {
      ...updatedIngredients[groupIndex],
      ingredients: updatedIngredients[groupIndex].ingredients.map((ingredient: Ingredient, idx: number) =>
        idx === ingredientIndex
          ? { ...ingredient, description }
          : ingredient
      )
    }
    setValue('ingredients', updatedIngredients, { shouldDirty: true })
  }

  if (ingredients.length === 0) {
    return (
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-gray-500 text-center">
          Geen ingrediënten toegevoegd
        </Text>
        {errors?.ingredients && (
          <Text className="text-red-500 text-sm mt-2 text-center">
            {errors.ingredients.message}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View className="space-y-6">
      {ingredients.map((group: IngredientGroup, groupIndex: number) => (
        <View key={`group-${groupIndex}-${group.name || 'unnamed'}`} className="bg-gray-50 rounded-lg p-6">
          {/* Group Name */}
          <TextInput
            value={group.name}
            onChangeText={(name) => handleGroupNameChange(groupIndex, name)}
            placeholder="Groep naam (optioneel)"
            placeholderTextColor="#9CA3AF"
            className="text-lg font-semibold text-gray-800 mb-4 bg-white rounded-lg px-4 py-3 border border-gray-200"
          />
          
          {/* Ingredients */}
          <View className="space-y-4">
            {group.ingredients.map((ingredient: Ingredient, ingredientIndex: number) => (
              <View key={`ingredient-${groupIndex}-${ingredientIndex}-${ingredient.description || 'unnamed'}`} className="bg-white rounded-lg p-4 border border-gray-200">
                <View className="flex-row space-x-3">
                  {/* Quantity Input */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-2">Hoeveelheid</Text>
                    <TextInput
                      value={ingredient.quantity.low.toString()}
                      onChangeText={(text) => {
                        const quantity = parseFloat(text) || 0
                        handleIngredientQuantityChange(groupIndex, ingredientIndex, quantity)
                      }}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                    />
                  </View>
                  
                  {/* Unit Input */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-2">Eenheid</Text>
                    <TextInput
                      value={ingredient.unit}
                      onChangeText={(unit) => handleIngredientUnitChange(groupIndex, ingredientIndex, unit)}
                      placeholder="gram, ml, stuks..."
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                    />
                  </View>
                </View>
                
                {/* Description Input */}
                <View className="mt-3">
                  <Text className="text-sm text-gray-600 mb-2">Ingrediënt</Text>
                  <TextInput
                    value={ingredient.description}
                    onChangeText={(description) => handleIngredientDescriptionChange(groupIndex, ingredientIndex, description)}
                    placeholder="Naam van het ingrediënt"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
      
      {errors?.ingredients && (
        <Text className="text-red-500 text-sm">
          {errors.ingredients.message}
        </Text>
      )}
    </View>
  )
}
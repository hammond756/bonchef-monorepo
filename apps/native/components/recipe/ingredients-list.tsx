import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { RecipeRead as Recipe } from '@repo/lib/services/recipes'

interface IngredientsListProps {
  ingredients: Recipe['ingredients']
  onIngredientsChange: (ingredients: Recipe['ingredients']) => void
  errors?: Record<string, string | undefined>
}

export function IngredientsList({
  ingredients,
  onIngredientsChange,
  errors,
}: IngredientsListProps) {
  if (ingredients.length === 0) {
    return (
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-gray-500 text-center">
          Geen ingrediënten toegevoegd
        </Text>
        {errors?.ingredients && (
          <Text className="text-red-500 text-sm mt-2 text-center">
            {errors.ingredients}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View className="space-y-4">
      {ingredients.map((group, groupIndex) => (
        <View key={groupIndex} className="bg-gray-50 rounded-lg p-4">
          {group.name && (
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {group.name}
            </Text>
          )}
          
          <View className="space-y-2">
            {group.ingredients.map((ingredient, ingredientIndex) => (
              <View key={ingredientIndex} className="flex-row items-center">
                <Text className="text-gray-600 text-base flex-1">
                  {ingredient.quantity.low > 0 && `${ingredient.quantity.low} `}
                  {ingredient.unit && ingredient.unit !== 'none' && `${ingredient.unit} `}
                  {ingredient.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      
      {errors?.ingredients && (
        <Text className="text-red-500 text-sm">
          {errors.ingredients}
        </Text>
      )}
    </View>
  )
}

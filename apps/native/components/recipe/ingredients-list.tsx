import { View, Text, TextInput } from 'react-native'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
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
  const { control } = useFormContext<RecipeUpdate>()
  const { fields: ingredientGroups } = useFieldArray({
    control,
    name: 'ingredients'
  })

  // No need for manual handlers - useFieldArray handles updates automatically

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
      {ingredientGroups.map((field, groupIndex) => (
        <View key={field.id} className="bg-gray-50 rounded-lg p-6">
          {/* Group Name */}
          <Controller
            name={`ingredients.${groupIndex}.name`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value || ''}
                onChangeText={onChange}
                placeholder="Groep naam (optioneel)"
                placeholderTextColor="#9CA3AF"
                className="text-lg font-semibold text-gray-800 mb-4 bg-white rounded-lg px-4 py-3 border border-gray-200"
              />
            )}
          />
          
          {/* Ingredients */}
          <View className="space-y-4">
            {field.ingredients?.map((_: Ingredient, ingredientIndex: number) => (
              <View key={`ingredient-${field.id}-${ingredientIndex}`} className="bg-white rounded-lg p-4 border border-gray-200">
                <View className="flex-row space-x-3">
                  {/* Quantity Input */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-2">Hoeveelheid</Text>
                    <Controller
                      name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.quantity.low`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          value={value?.toString() || '0'}
                          onChangeText={(text) => {
                            const quantity = parseFloat(text) || 0
                            onChange(quantity)
                          }}
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                        />
                      )}
                    />
                  </View>
                  
                  {/* Unit Input */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-2">Eenheid</Text>
                    <Controller
                      name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.unit`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          value={value || ''}
                          onChangeText={onChange}
                          placeholder="gram, ml, stuks..."
                          placeholderTextColor="#9CA3AF"
                          className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                        />
                      )}
                    />
                  </View>
                </View>
                
                {/* Description Input */}
                <View className="mt-3">
                  <Text className="text-sm text-gray-600 mb-2">Ingrediënt</Text>
                  <Controller
                    name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.description`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value || ''}
                        onChangeText={onChange}
                        placeholder="Naam van het ingrediënt"
                        placeholderTextColor="#9CA3AF"
                        className="bg-gray-50 rounded-lg px-3 py-3 text-base text-gray-800 border border-gray-200"
                      />
                    )}
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
import type { RecipeUpdate } from '@repo/lib/services/recipes'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'

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
    <View>
      {ingredientGroups.map((field, groupIndex) => (
        <View key={field.id} className="mb-6">
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
                className="font-semibold text-gray-900 bg-white rounded-lg px-4 py-4 border border-gray-300 shadow-sm mb-4"
                style={{ lineHeight: 20, fontSize: 16 }}
              />
            )}
          />
          
          {/* Ingredients */}
          <View>
            {field.ingredients?.map((_: Ingredient, ingredientIndex: number) => (
              <View key={`ingredient-${field.id}-${ingredientIndex}`} className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                <View>
                  <View className="flex-row">
                    {/* Quantity Input */}
                    <View className="flex-1 mr-2">
                      <Text className="text-sm text-gray-700 mb-3 font-medium">Hoeveelheid</Text>
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
                            className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm font-montserrat"
                            style={{ lineHeight: 20, fontSize: 16 }}
                          />
                        )}
                      />
                    </View>
                    
                    {/* Unit Input */}
                    <View className="flex-1 ml-2">
                      <Text className="text-sm text-gray-700 mb-3 font-medium">Eenheid</Text>
                      <Controller
                        name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.unit`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            value={value || ''}
                            onChangeText={onChange}
                            placeholder="gram, ml, stuks..."
                            placeholderTextColor="#9CA3AF"
                            className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm font-montserrat"
                            style={{ lineHeight: 20, fontSize: 16 }}
                          />
                        )}
                      />
                    </View>
                  </View>
                  
                  {/* Description Input */}
                  <View className="mt-4">
                    <Text className="text-sm text-gray-700 mb-3 font-medium">Ingrediënt</Text>
                    <Controller
                      name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.description`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          value={value || ''}
                          onChangeText={onChange}
                          placeholder="Naam van het ingrediënt"
                          placeholderTextColor="#9CA3AF"
                          className="bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm font-montserrat"
                          style={{ lineHeight: 20, fontSize: 16 }}
                        />
                      )}
                    />
                  </View>
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
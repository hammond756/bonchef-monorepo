import type { RecipeUpdate } from '@repo/lib/services/recipes'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'
import NumberInput from '../ui/number-input'
import { Input } from '../ui'

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

  const getIngredientGroupName = (value: string) => {
    if (value === "no_group") {
      return ""
    }
    return value
  }

  const setIngredientGroupName = (value: string) => {
    if (value === "") {
      return "no_group"
    }
    return value
  }

  const getUnitValue = (value: string) => {
    if (value === "none") {
      return ""
    }
    return value
  }

  const setUnitValue = (value: string) => {
    if (value === "") {
      return "none"
    }
    return value
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
    <View>
      {ingredientGroups.map((field, groupIndex) => (
        <View key={field.id} className="mb-6">
          {/* Group Name */}
          <Controller
            name={`ingredients.${groupIndex}.name`}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Input
                label="Groep titel (optioneel)"
                value={getIngredientGroupName(value) || ''}
                onChangeText={(text) => onChange(setIngredientGroupName(text))}
                placeholder="Bijv: Voor de saus"
                className="font-semibold text-gray-900 rounded-lg shadow-sm mb-4"
                error={error?.message || undefined}
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
                      <Controller
                        name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.quantity.low`}
                        control={control}
                        rules={{
                          pattern: {
                            value: /^\d*\.?\d+$/,
                            message: "Hoeveelheid moet een getal zijn"
                          }
                        }}
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                          <NumberInput
                            label="Hoeveelheid"
                            value={value?.toString() || ''}
                            onChangeText={onChange}
                            placeholder="leeg"
                            error={error?.message || undefined}
                          />
                        )}
                      />
                    </View>
                    
                    {/* Unit Input */}
                    <View className="flex-1 ml-2">
                      <Controller
                        name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.unit`}
                        control={control}
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                          <Input
                            label="Eenheid"
                            value={getUnitValue(value) || ''}
                            onChangeText={(text) => onChange(setUnitValue(text))}
                            placeholder="gram, ml, stuks..."
                            error={error?.message || undefined}
                          />
                        )}
                      />
                    </View>
                  </View>
                  
                  {/* Description Input */}
                  <View className="mt-4">
                    <Controller
                      name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}.description`}
                      control={control}
                      rules={{
                        required: 'Lege naam is niet toegestaan',
                      }}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Input
                          label="Ingrediënt"
                          value={value}
                          onChangeText={onChange}
                          placeholder="Naam van het ingrediënt"
                          error={error?.message || undefined}
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
    </View>
  )
}
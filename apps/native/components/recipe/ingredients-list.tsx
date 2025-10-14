import type { RecipeUpdate } from '@repo/lib/services/recipes'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'
import { Input } from '../ui'
import IngredientBar from './ingredient-bar'

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
                error={error?.message || undefined}
              />
            )}
          />
          
          {/* Ingredients */}
          <View>
            {field.ingredients?.map((_, ingredientIndex: number) => (
              <Controller
                key={`ingredient-${field.id}-${ingredientIndex}`}
                name={`ingredients.${groupIndex}.ingredients.${ingredientIndex}`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <IngredientBar
                    ingredient={value}
                    onUpdate={onChange}
                  />
                )}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}
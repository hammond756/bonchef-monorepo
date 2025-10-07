import { View, Text, TextInput } from 'react-native'
import { useFormContext, Controller } from 'react-hook-form'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

interface InstructionsListProps {
  instructions: string[]
  errors?: Record<string, { message?: string }>
}

export function InstructionsList({
  instructions,
  errors,
}: InstructionsListProps) {
  const { control } = useFormContext<RecipeUpdate>()

  if (instructions.length === 0) {
    return (
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-gray-500 text-center">
          Geen instructies toegevoegd
        </Text>
        {errors?.instructions && (
          <Text className="text-red-500 text-sm mt-2 text-center">
            {errors.instructions.message}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View className="space-y-8">
      {instructions.map((_, index) => (
        <View key={`instruction-${index}-${instructions[index]?.slice(0, 10) || 'empty'}`} className="space-y-4">
          <View className="flex-1 mb-4">
            <Text className="text-sm text-gray-700 mb-3 font-medium">
              Stap {index + 1}
            </Text>
              <Controller
                name={`instructions.${index}`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={`Stap ${index + 1} beschrijving...`}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    className="bg-white rounded-lg px-4 py-4 text-gray-900 border border-gray-300 shadow-sm min-h-[100px]"
                    style={{
                      minHeight: 100,
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                  />
                )}
              />
            </View>
        </View>
      ))}
      
      {errors?.instructions && (
        <Text className="text-red-500 text-sm">
          {errors.instructions.message}
        </Text>
      )}
    </View>
  )
}
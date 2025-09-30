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
    <View className="space-y-4">
      {instructions.map((_, index) => (
        <View key={`instruction-${index}-${instructions[index]?.slice(0, 10) || 'empty'}`} className="bg-gray-50 rounded-lg p-6">
          <View className="flex-row">
            <View className="bg-green-600 rounded-full w-8 h-8 items-center justify-center mr-4 mt-1">
              <Text className="text-white text-sm font-semibold">
                {index + 1}
              </Text>
            </View>
            <View className="flex-1">
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
                    className="bg-white rounded-lg px-4 py-3 text-base text-gray-800 border border-gray-200 min-h-[80px]"
                    style={{
                      minHeight: 80,
                    }}
                  />
                )}
              />
            </View>
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
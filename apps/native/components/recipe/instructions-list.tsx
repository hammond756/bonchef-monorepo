import { View, Text } from 'react-native'
import { useFormContext, Controller } from 'react-hook-form'
import type { RecipeUpdate } from '@repo/lib/services/recipes'
import TextArea from '../ui/textarea'

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
    <View>
      {instructions.map((_, index) => (
        <View key={`instruction-${index}`} className="space-y-4">
          <View className="flex-1 mb-4">
              <Controller
                name={`instructions.${index}`}
                control={control}
                rules={{
                  required: 'Lege bereidingstappen zijn niet toegestaan',
                }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <TextArea
                    label={`Stap ${index + 1}`}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`Beschrijving voor stap ${index + 1}`}
                    minHeight={100}
                    maxHeight={120}
                    error={error?.message || undefined}
                  />
                )}
              />
            </View>
        </View>
      ))}
    </View>
  )
}
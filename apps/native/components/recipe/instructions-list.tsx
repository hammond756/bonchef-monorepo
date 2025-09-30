import { View, Text, TextInput } from 'react-native'

interface InstructionsListProps {
  instructions: string[]
  onInstructionsChange: (instructions: string[]) => void
  errors?: Record<string, string | undefined>
}

export function InstructionsList({
  instructions,
  onInstructionsChange,
  errors,
}: InstructionsListProps) {
  const handleInstructionChange = (index: number, instruction: string) => {
    const updatedInstructions = [...instructions]
    updatedInstructions[index] = instruction
    onInstructionsChange(updatedInstructions)
  }

  if (instructions.length === 0) {
    return (
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-gray-500 text-center">
          Geen instructies toegevoegd
        </Text>
        {errors?.instructions && (
          <Text className="text-red-500 text-sm mt-2 text-center">
            {errors.instructions}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View className="space-y-4">
      {instructions.map((instruction, index) => (
        <View key={`instruction-${index}-${instruction.slice(0, 20)}`} className="bg-gray-50 rounded-lg p-6">
          <View className="flex-row">
            <View className="bg-green-600 rounded-full w-8 h-8 items-center justify-center mr-4 mt-1">
              <Text className="text-white text-sm font-semibold">
                {index + 1}
              </Text>
            </View>
            <View className="flex-1">
              <TextInput
                value={instruction}
                onChangeText={(text) => handleInstructionChange(index, text)}
                placeholder={`Stap ${index + 1} beschrijving...`}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="bg-white rounded-lg px-4 py-3 text-base text-gray-800 border border-gray-200 min-h-[80px]"
                style={{
                  minHeight: 80,
                }}
              />
            </View>
          </View>
        </View>
      ))}
      
      {errors?.instructions && (
        <Text className="text-red-500 text-sm">
          {errors.instructions}
        </Text>
      )}
    </View>
  )
}

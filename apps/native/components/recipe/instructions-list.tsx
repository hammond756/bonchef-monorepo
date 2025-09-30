import React from 'react'
import { View, Text } from 'react-native'

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
        <View key={index} className="bg-gray-50 rounded-lg p-4">
          <View className="flex-row">
            <View className="bg-green-600 rounded-full w-6 h-6 items-center justify-center mr-3 mt-1">
              <Text className="text-white text-sm font-semibold">
                {index + 1}
              </Text>
            </View>
            <Text className="text-gray-800 text-base flex-1 leading-6">
              {instruction}
            </Text>
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

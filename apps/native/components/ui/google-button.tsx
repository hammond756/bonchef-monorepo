import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'

interface GoogleButtonProps {
  onPress: () => void
  disabled?: boolean
  className?: string
  text?: string
}

export default function GoogleButton({ 
  onPress, 
  disabled = false,
  className = '',
  text = 'Aanmelden met Google'
}: GoogleButtonProps) {
  return (
    <TouchableOpacity 
      className={`bg-white border border-gray-300 rounded-lg py-4 px-5 flex-row items-center justify-center shadow-sm ${className}`}
      disabled={disabled} 
      onPress={onPress}
    >
      <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center mr-3">
        <Text className="text-white text-sm font-bold">G</Text>
      </View>
      <Text className="text-base text-gray-800 font-medium">{text}</Text>
    </TouchableOpacity>
  )
}

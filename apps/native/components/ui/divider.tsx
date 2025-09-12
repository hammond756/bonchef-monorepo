import React from 'react'
import { View, Text } from 'react-native'

interface DividerProps {
  text?: string
  className?: string
}

export default function Divider({ text = 'OF', className = '' }: DividerProps) {
  return (
    <View className={`flex-row items-center mb-6 ${className}`}>
      <View className="flex-1 h-px bg-gray-300" />
      <Text className="text-sm text-gray-400 mx-4 font-medium">{text}</Text>
      <View className="flex-1 h-px bg-gray-300" />
    </View>
  )
}

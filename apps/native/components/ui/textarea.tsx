import React from 'react'
import { TextInput, Text, View } from 'react-native'

interface TextAreaProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  helperText?: string
  error?: string
  maxLength?: number
  minHeight?: number
  maxHeight?: number
  className?: string
}

export default function TextArea({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  error,
  maxLength,
  minHeight = 80,
  maxHeight = 120,
  className = ''
}: TextAreaProps) {
  return (
    <View className={`mb-5 ${className}`}>
      <Text className="text-base text-gray-800 mb-2 font-medium">{label}</Text>
      <TextInput
        className={`bg-white border rounded-lg px-4 py-3 text-base text-gray-800 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        style={{
          minHeight,
          maxHeight,
        }}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-sm text-gray-500 mt-1">{helperText}</Text>
      )}
      {maxLength && (
        <Text className="text-xs text-gray-400 mt-1 text-right">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  )
}

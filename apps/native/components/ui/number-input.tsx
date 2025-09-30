import React from 'react'
import { TextInput, Text, View } from 'react-native'

interface NumberInputProps {
  label: string
  placeholder: string
  value: number
  onChangeText: (value: number) => void
  helperText?: string
  error?: string
  min?: number
  max?: number
  className?: string
}

export default function NumberInput({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  error,
  min,
  max,
  className = ''
}: NumberInputProps) {
  const handleTextChange = (text: string) => {
    const numericValue = parseInt(text, 10);
    if (!isNaN(numericValue)) {
      let finalValue = numericValue;
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
      onChangeText(finalValue);
    } else if (text === '') {
      onChangeText(0);
    }
  };

  return (
    <View className={`mb-5 ${className}`}>
      <Text className="text-base text-gray-800 mb-2 font-medium">{label}</Text>
      <TextInput
        className={`bg-white border rounded-lg px-4 py-3 text-base text-gray-800 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onChangeText={handleTextChange}
        value={value.toString()}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        keyboardType="numeric"
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-sm text-gray-500 mt-1">{helperText}</Text>
      )}
    </View>
  )
}

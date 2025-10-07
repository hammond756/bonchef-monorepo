import { TextInput, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface NumberInputProps {
  label?: string
  placeholder: string
  value: number
  onChangeText: (value: number) => void
  helperText?: string
  error?: string
  min?: number
  max?: number
  className?: string
  icon?: keyof typeof Ionicons.glyphMap
  suffix?: string
  compact?: boolean
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
  className = '',
  icon,
  suffix,
  compact = false
}: NumberInputProps) {
  const handleTextChange = (text: string) => {
    const numericValue = parseInt(text, 10);
    if (!Number.isNaN(numericValue)) {
      let finalValue = numericValue;
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
      onChangeText(finalValue);
    }
    // Don't call onChangeText for empty string - preserve last valid value
  };

  if (compact && icon) {
    return (
      <View className={`flex-1 ${className}`}>
        <View className="flex-row items-center bg-white rounded-lg px-4 py-4 border border-gray-300 shadow-sm">
          <Ionicons name={icon} size={20} color="#4B5563" />
          <TextInput
            value={value.toString()}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className="flex-1 ml-3 text-gray-900"
            style={{ lineHeight: 20, fontSize: 16 }}
          />
          {suffix && (
            <Text className="text-gray-500 text-sm ml-2">{suffix}</Text>
          )}
        </View>
        {error && (
          <Text className="text-red-500 text-xs mt-1">{error}</Text>
        )}
      </View>
    )
  }

  return (
    <View className={`mb-6 ${className}`}>
      {label && (
        <Text className="text-sm text-gray-700 mb-3 font-medium">{label}</Text>
      )}
      <TextInput
        className={`bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onChangeText={handleTextChange}
        value={value.toString()}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        style={{ lineHeight: 20, fontSize: 16 }}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-2">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-sm text-gray-500 mt-2">{helperText}</Text>
      )}
    </View>
  )
}

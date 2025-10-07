import { TextInput, Text, View } from 'react-native'

interface URLInputProps {
  label?: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  helperText?: string
  error?: string
  className?: string
}

export default function URLInput({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  error,
  className = ''
}: URLInputProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {label && (
        <Text className="text-sm text-gray-700 mb-3 font-medium">{label}</Text>
      )}
      <TextInput
        className={`bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
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

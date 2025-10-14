import { TextInput, Text, View } from 'react-native'

interface TextAreaProps {
  label?: string
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
    <View className={`mb-6 ${className}`}>
      {label && (
        <Text className="text-sm text-gray-700 mb-3 font-medium font-montserrat">{label}</Text>
      )}
      <TextInput
        className={`bg-white rounded-lg px-4 py-5 text-gray-900 border border-gray-300 shadow-sm font-montserrat ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        style={{
          minHeight,
          maxHeight,
          lineHeight: 20,
          fontSize: 16,
        }}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-2 font-montserrat">{error}</Text>
      )}
      {(helperText || maxLength) && (
        <View className="flex-row justify-between items-center mt-2">
          <View className="">
            {helperText && (
              <Text className="text-sm text-gray-500 font-montserrat">{helperText}</Text>
            )}
          </View>
          {maxLength && (
            <Text className="text-xs text-gray-400 font-montserrat">
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

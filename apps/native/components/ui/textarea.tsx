import { type StyleProp, Text, TextInput, type TextInputProps, type TextStyle, View } from 'react-native'

interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline' | 'textAlignVertical'> {
  label?: string
  helperText?: string
  error?: string
  minHeight?: number
  maxHeight?: number
  className?: string
  inputStyle?: StyleProp<TextStyle>
}

export default function TextArea({
  label,
  helperText,
  error,
  minHeight = 80,
  maxHeight = 120,
  className = '',
  inputStyle,
  placeholderTextColor = "#9CA3AF",
  ...textInputProps
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
        placeholderTextColor={placeholderTextColor}
        multiline
        textAlignVertical="top"
        style={[
          {
            minHeight,
            maxHeight,
            lineHeight: 20,
            fontSize: 16,
          },
          inputStyle,
        ]}
        {...textInputProps}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-2 font-montserrat">{error}</Text>
      )}
      {(helperText || textInputProps.maxLength) && (
        <View className="flex-row justify-between items-center mt-2">
          <View className="">
            {helperText && (
              <Text className="text-sm text-gray-500 font-montserrat">{helperText}</Text>
            )}
          </View>
          {textInputProps.maxLength && textInputProps.value && (
            <Text className="text-xs text-gray-400 font-montserrat">
              {String(textInputProps.value).length}/{textInputProps.maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

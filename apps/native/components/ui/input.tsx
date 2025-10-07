import { useState } from 'react'
import { TextInput, Text, View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InputProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  helperText?: string
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  className?: string
  error?: string
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  helperText,
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = '',
  error = '',
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-sm text-gray-700 mb-3 font-medium">{label}</Text>
      <View className={`flex-row items-center bg-white rounded-lg px-4 py-5 border border-gray-300 shadow-sm ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        <TextInput
          className="flex-1 text-gray-900 py-0"
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{ lineHeight: 20, fontSize: 16 }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="ml-2">
            <Ionicons 
              name={isPasswordVisible ? "eye" : "eye-off"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        )}
      </View>
      {helperText && !error && (
        <Text className="text-sm text-gray-500 mt-2">{helperText}</Text>
      )}
      {error && (
        <Text className="text-red-500 text-xs mt-2">{error}</Text>
      )}
    </View>
  )
}

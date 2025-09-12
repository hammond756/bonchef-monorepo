import React, { useState } from 'react'
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
  className = ''
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View className={`mb-5 ${className}`}>
      <Text className="text-base text-gray-800 mb-2 font-medium">{label}</Text>
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
        <TextInput
          className="flex-1 text-base text-gray-800 py-0"
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#AAA"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="ml-2">
            <Ionicons 
              name={isPasswordVisible ? "eye" : "eye-off"} 
              size={20} 
              color="#AAA" 
            />
          </TouchableOpacity>
        )}
      </View>
      {helperText && (
        <Text className="text-sm text-gray-500 mt-1">{helperText}</Text>
      )}
    </View>
  )
}

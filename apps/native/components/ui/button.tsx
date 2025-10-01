import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'google'
  disabled?: boolean
  className?: string
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  className = ''
}: ButtonProps) {
  const getButtonStyles = () => {
    const baseStyles = "rounded-lg py-4 px-5 flex-row items-center justify-center"
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-[#1E4D37] ${className}`
      case 'secondary':
        return `${baseStyles} bg-white border border-gray-300 ${className}`
      default:
        return `${baseStyles} bg-[#1E4D37] ${className}`
    }
  }

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return "text-white text-base font-medium"
      case 'secondary':
        return "text-gray-800 text-base font-medium"
      default:
        return "text-white text-base font-medium"
    }
  }

  return (
    <TouchableOpacity 
      className={getButtonStyles()}
      disabled={disabled} 
      onPress={onPress}
    >
      <Text className={getTextStyles()}>{title}</Text>
    </TouchableOpacity>
  )
}

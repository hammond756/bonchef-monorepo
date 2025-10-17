import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { Image } from 'expo-image'

interface GoogleButtonProps {
  onPress: () => void
  disabled?: boolean
  className?: string
  text?: string
}

export default function GoogleButton({ 
  onPress, 
  disabled = false,
  className = '',
  text = 'Aanmelden met Google'
}: GoogleButtonProps) {
  return (

    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center bg-white border border-[#dbdbdb] rounded-lg py-4 px-5 justify-center shadow-sm ${className}`}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Image
        source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
        style={{ width: 24, height: 24, marginRight: 10 }}
      />
      <Text
        className="text-base text-gray-700 font-medium font-sansserif"
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

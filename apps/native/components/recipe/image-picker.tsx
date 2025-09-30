import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

interface ImagePickerProps {
  imageUrl?: string | null
  onImageChange: (uri: string) => void
  className?: string
}

export function RecipeImagePicker({
  imageUrl,
  onImageChange,
  className = ''
}: ImagePickerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Toestemming vereist',
        'We hebben toegang tot je foto\'s nodig om een afbeelding te selecteren.'
      )
      return false
    }
    return true
  }

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Toestemming vereist',
        'We hebben toegang tot je camera nodig om een foto te maken.'
      )
      return false
    }
    return true
  }

  const pickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Fout', 'Er is een fout opgetreden bij het selecteren van de afbeelding.')
    } finally {
      setIsLoading(false)
    }
  }

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions()
    if (!hasPermission) return

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Fout', 'Er is een fout opgetreden bij het maken van de foto.')
    } finally {
      setIsLoading(false)
    }
  }

  const showImageOptions = () => {
    Alert.alert(
      'Afbeelding toevoegen',
      'Kies hoe je een afbeelding wilt toevoegen',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Camera', onPress: takePhoto },
        { text: 'Galerij', onPress: pickImage },
      ]
    )
  }

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-base text-gray-800 mb-3 font-medium">Recept afbeelding</Text>
      
      {imageUrl ? (
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={showImageOptions}
            disabled={isLoading}
            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2"
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          disabled={isLoading}
          className="border-2 border-dashed border-gray-300 rounded-lg h-48 items-center justify-center bg-gray-50"
        >
          <Ionicons name="camera" size={32} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2 text-center">
            {isLoading ? 'Laden...' : 'Tap om afbeelding toe te voegen'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

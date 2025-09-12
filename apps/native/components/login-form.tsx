import { supabase } from '@/lib/utils/supabase/client'
import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native'
import * as authService from '@repo/lib/services/auth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    try {
      await authService.login(supabase, email, password)
      Alert.alert('Success', 'Successfully signed in!')
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in')
    }
    setLoading(false)
  }

  async function signInWithGoogle() {
    setLoading(true)
    try {
      const data = await authService.loginWithGoogle(supabase)
      if (data.url) {
        // For native apps, you might need to handle the OAuth flow differently
        // This is a placeholder - you may need to use a different approach for native OAuth
        Alert.alert('Info', 'Google login initiated. Check your browser for the OAuth flow.')
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in with Google')
    }
    setLoading(false)
  }

  const handleTimelinePress = () => {
    // Navigate to timeline or show public recipes
    Alert.alert('Timeline', 'Navigate to public recipes timeline')
  }

  const handleTestAccountPress = () => {
    // Set test account credentials
    setEmail('test@example.com')
    setPassword('testpassword')
  }

  const handleRegisterPress = () => {
    // Navigate to registration or show registration form
    Alert.alert('Registratie', 'Navigate to registration form')
  }

  return (
    <View className="flex-1 flex-col bg-white px-6 py-10 justify-center">
      {/* Header Section */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">Welkom!</Text>
      </View>

      {/* Google Login Button */}
      <TouchableOpacity 
        className="bg-white border border-gray-300 rounded-lg py-4 px-5 flex-row items-center justify-center mb-6 shadow-sm"
        disabled={loading} 
        onPress={() => signInWithGoogle()}
      >
        <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-sm font-bold">G</Text>
        </View>
        <Text className="text-base text-gray-800 font-medium">Log in met Google</Text>
      </TouchableOpacity>

      {/* Separator */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="text-sm text-gray-400 mx-4 font-medium">OF</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Email Input */}
      <View className="mb-5">
        <Text className="text-base text-gray-800 mb-2 font-medium">Email</Text>
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
          <TextInput
            className="flex-1 text-base text-gray-800 py-0"
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="name@example.com"
            placeholderTextColor="#AAA"
            autoCapitalize={'none'}
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Password Input */}
      <View className="mb-5">
        <Text className="text-base text-gray-800 mb-2 font-medium">Wachtwoord</Text>
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
          <TextInput
            className="flex-1 text-base text-gray-800 py-0"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Wachtwoord"
            placeholderTextColor="#AAA"
            autoCapitalize={'none'}
          />
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity 
        className="bg-green-700 rounded-lg py-4 items-center justify-center mt-2 mb-6"
        disabled={loading} 
        onPress={() => signInWithEmail()}
      >
        <Text className="text-white text-base font-medium">Inloggen</Text>
      </TouchableOpacity>

      {/* Registration Link */}
      <TouchableOpacity onPress={handleRegisterPress} className="items-center">
        <Text className="text-base text-gray-600">
          Nog geen account? <Text className="underline text-green-700">Meld je dan hier aan</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}
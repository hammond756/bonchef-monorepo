import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, Input, Divider, GoogleButton } from '@/components/ui'
import { supabase } from '@/lib/utils/supabase/client'
import * as authService from '@repo/lib/services/auth'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Wachtwoord moet minimaal 6 karakters bevatten')
      return
    }

    setLoading(true)
    try {
      await authService.signup(supabase, email, password)
      Alert.alert('Success', 'Account succesvol aangemaakt!')
      router.push('/')
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account')
    }
    setLoading(false)
  }

  async function signUpWithGoogle() {
    setLoading(true)
    try {
      const data = await authService.loginWithGoogle(supabase)
      if (data.url) {
        Alert.alert('Info', 'Google login initiated. Check your browser for the OAuth flow.')
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up with Google')
    }
    setLoading(false)
  }

  const handleLoginPress = () => {
    router.push('/')
  }

  return (
    <View className="flex-1 flex-col bg-white px-6 py-10 justify-center">
      {/* Header Section */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">Account aanmaken</Text>
        <Text className="text-base text-gray-600 text-center">
          Maak een account aan om gebruik te maken van Bonchef.
        </Text>
      </View>

      {/* Google Signup Button */}
      <GoogleButton 
        disabled={loading} 
        onPress={signUpWithGoogle}
        className="mb-6"
      />

      {/* Separator */}
      <Divider />

      {/* Email Input */}
      <Input
        label="Email"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Username Input */}
      <Input
        label="Gebruikersnaam"
        placeholder="John Doe"
        value={username}
        onChangeText={setUsername}
        helperText="De naam waaronder je publieke recepten zichtbaar zijn"
      />

      {/* Password Input */}
      <Input
        label="Wachtwoord"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      {/* Confirm Password Input */}
      <Input
        label="Bevestig wachtwoord"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      {/* Signup Button */}
      <Button 
        title="Account aanmaken"
        onPress={signUpWithEmail}
        disabled={loading}
        className="mt-2 mb-6"
      />

      {/* Login Link */}
      <TouchableOpacity onPress={handleLoginPress} className="items-center">
        <Text className="text-base text-gray-600">
          Heb je al een account? <Text className="underline text-green-700">Log dan hier in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}
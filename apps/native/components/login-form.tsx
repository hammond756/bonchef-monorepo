import { useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, Input, Divider } from '@/components/ui'
import GoogleSignInButton from '@/components/google-sign-in-button'
import * as authService from '@repo/lib/services/auth'
import { supabase } from '@/lib/utils/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    try {
      await authService.login(supabase, email, password)
      router.push('/discover')
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in')
    }
    setLoading(false)
  }

  const handleGoogleSignInSuccess = () => {
    router.push('/discover')
  }

  const handleGoogleSignInError = (error: Error) => {
    Alert.alert('Error', error.message || 'Failed to sign in with Google')
  }

  const handleSignupPress = () => {
    router.push('/signup')
  }

  return (
    <View className="flex-1 flex-col bg-white px-6 py-10 justify-center">
      {/* Header Section */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">Welkom!</Text>
      </View>

      {/* Google Login Button */}
      <GoogleSignInButton 
        disabled={loading} 
        onSuccess={handleGoogleSignInSuccess}
        onError={handleGoogleSignInError}
        className="mb-6"
        text="Log in met Google"
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

      {/* Password Input */}
      <Input
        label="Wachtwoord"
        placeholder="Wachtwoord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      {/* Login Button */}
      <Button 
        title="Inloggen"
        onPress={signInWithEmail}
        disabled={loading}
        className="mt-2 mb-6"
      />

      {/* Registration Link */}
      <TouchableOpacity onPress={handleSignupPress} className="items-center">
        <Text className="text-base text-gray-600">
          Nog geen account? <Text className="underline text-green-700">Meld je dan hier aan</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}
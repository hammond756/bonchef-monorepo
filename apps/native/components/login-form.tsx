import { supabase } from '@/lib/utils/supabase/client'
import React, { useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
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

  async function signUpWithEmail() {
    setLoading(true)
    try {
      await authService.signup(supabase, email, password)
      Alert.alert('Success', 'Account created! Please check your inbox for email verification.')
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account')
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

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text>Email</Text>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text>Password</Text>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in with Google" disabled={loading} onPress={() => signInWithGoogle()} />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})
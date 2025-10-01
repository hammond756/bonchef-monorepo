import { View, ActivityIndicator, Text } from 'react-native'

export function AuthLoading() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#1E4D37" />
      <Text className="text-gray-600 mt-4 text-base">Laden...</Text>
    </View>
  )
}

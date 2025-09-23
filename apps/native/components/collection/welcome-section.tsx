import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';


export function WelcomeSection() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* Icon */}
      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="restaurant-outline" size={40} color="#1E4D37" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
        Welkom bij Bonchef!
      </Text>

      {/* Description */}
      <Text className="text-gray-600 text-center mb-8 leading-6">
        Importeer je eerste recept om te beginnen. Je kunt recepten importeren van websites, 
        foto's maken, of tekst plakken.
      </Text>

      {/* Tips */}
      <View className="mt-8 w-full">
        <Text className="text-gray-500 text-sm text-center mb-4">
          Pro tips:
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-gray-600 text-sm ml-2">
              Instagram Reels en TikTok's werken het beste
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-gray-600 text-sm ml-2">
              Maak een foto van een recept uit een kookboek
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-gray-600 text-sm ml-2">
              Plak tekst van een website of app
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

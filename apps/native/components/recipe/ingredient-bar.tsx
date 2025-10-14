import { useState } from 'react'
import { View, Text, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import IngredientEditModal from './ingredient-edit-modal'

type Ingredient = {
  quantity: {
    type: "range"
    low: number
    high: number
  }
  unit: string
  description: string
}

interface IngredientBarProps {
  ingredient: Ingredient
  onUpdate: (updatedIngredient: Ingredient) => void
}

export default function IngredientBar({
  ingredient,
  onUpdate,
}: IngredientBarProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pressAnim] = useState(new Animated.Value(0))

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()
  }

  const handlePress = () => {
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
  }

  const handleSave = (updatedIngredient: Ingredient) => {
    onUpdate(updatedIngredient)
    setIsModalVisible(false)
  }

  const formatQuantity = () => {
    if (ingredient.quantity.low === ingredient.quantity.high) {
      return ingredient.quantity.low.toString()
    }
    return `${ingredient.quantity.low}`
  }

  const formatUnit = () => {
    return ingredient.unit === 'none' ? '' : ingredient.unit
  }

  const animatedStyle = {
    transform: [
      {
        translateY: pressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
  }

  return (
    <>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          className="mb-3"
        >
          <View className="bg-white rounded-xl p-4 border border-gray-200" style={{ boxShadow: '1px 1px 0 #CCCCCC'}}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                {/* Quantity */}
                {ingredient.quantity.low > 0 && (
                  <View className="bg-gray-100 rounded-lg px-3 py-1 mr-3">
                    <Text className="text-black font-medium text-sm">
                      {formatQuantity()}
                    </Text>
                  </View>
                )}
                
                {/* Unit */}
                {formatUnit() && (
                  <View className="bg-gray-100 rounded-lg px-3 py-1 mr-3">
                    <Text className="text-black font-medium text-sm">
                      {formatUnit()}
                    </Text>
                  </View>
                )}
                
                {/* Description */}
                <Text className="text-gray-900 font-medium text-base flex-1" numberOfLines={1}>
                  {ingredient.description}
                </Text>
              </View>
              
              {/* Edit icon */}
              <View className="ml-3">
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <IngredientEditModal
        visible={isModalVisible}
        ingredient={ingredient}
        onClose={handleModalClose}
        onSave={handleSave}
      />
    </>
  )
}

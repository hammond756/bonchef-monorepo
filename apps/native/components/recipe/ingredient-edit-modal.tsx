import { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, NumberInput } from '../ui'

type Ingredient = {
  quantity: {
    type: "range"
    low: number
    high: number
  }
  unit: string
  description: string
}

interface IngredientEditModalProps {
  visible: boolean
  ingredient: Ingredient
  onClose: () => void
  onSave: (ingredient: Ingredient) => void
}

export default function IngredientEditModal({
  visible,
  ingredient,
  onClose,
  onSave,
}: IngredientEditModalProps) {
  const [formData, setFormData] = useState({
    quantityLow: ingredient.quantity.low.toString(),
    unit: ingredient.unit === 'none' ? '' : ingredient.unit,
    description: ingredient.description,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (visible) {
      setFormData({
        quantityLow: ingredient.quantity.low.toString(),
        unit: ingredient.unit === 'none' ? '' : ingredient.unit,
        description: ingredient.description,
      })
      setErrors({})
    }
  }, [visible, ingredient])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Ingrediënt naam is verplicht'
    }

    if (formData.quantityLow && Number.isNaN(Number(formData.quantityLow))) {
      newErrors.quantityLow = 'Hoeveelheid moet een getal zijn'
}   

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    const quantityLow = formData.quantityLow ? Number(formData.quantityLow) : 0

    const updatedIngredient: Ingredient = {
      quantity: {
        type: "range",
        low: quantityLow,
        high: quantityLow,
      },
      unit: formData.unit || 'none',
      description: formData.description.trim(),
    }

    onSave(updatedIngredient)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 text-base font-medium font-montserrat">Annuleren</Text>
            </TouchableOpacity>
            
            <Text className="text-lg font-semibold text-gray-900 font-montserrat">
              Ingrediënt bewerken
            </Text>
            
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-blue-600 text-base font-semibold font-montserrat">Opslaan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-6">
            {/* Description */}
            <Input
              label="Ingrediënt"
              placeholder="Naam van het ingrediënt"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              error={errors.description}
              autoCapitalize="words"
            />

            {/* Quantity Range */}
            <View>
              <Text className="text-sm text-gray-700 mb-3 font-medium">
                Hoeveelheid (optioneel)
              </Text>
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <NumberInput
                    placeholder="Min"
                    value={formData.quantityLow}
                    onChangeText={(text) => updateFormData('quantityLow', text)}
                    error={errors.quantityLow}
                    helperText='Laat leeg om geen hoeveel te laten zien, zoals bij "Zout en peper".'
                  />
                </View>
              </View>
            </View>

            {/* Unit */}
            <Input
              label="Eenheid (optioneel)"
              placeholder="gram, ml, stuks, eetlepels..."
              value={formData.unit}
              onChangeText={(text) => updateFormData('unit', text)}
              autoCapitalize="none"
              helperText="Laat leeg om geen eenheid te laten zien, zoals bij '2 appels'."
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

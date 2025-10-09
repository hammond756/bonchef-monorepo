import { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecipeVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isPublic: boolean) => void;
  defaultVisibility?: boolean;
}

export function RecipeVisibilityModal({
  isOpen,
  onClose,
  onConfirm,
  defaultVisibility = false,
}: RecipeVisibilityModalProps) {
  const [isPublic, setIsPublic] = useState<boolean>(defaultVisibility);

  // Update selection when defaultVisibility changes
  useEffect(() => {
    setIsPublic(defaultVisibility);
  }, [defaultVisibility]);

  const handleConfirm = () => {
    onConfirm(isPublic);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="w-full max-w-sm">
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Recept opslaan</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text className="text-sm text-gray-500 mb-6">
              Kies hoe je dit recept wilt opslaan
            </Text>

            {/* Options */}
            <View className="mb-6">
              {/* Private Option */}
              <TouchableOpacity
                className="mb-4"
                onPress={() => setIsPublic(false)}
              >
                <View className="flex-row items-start">
                  <View className="flex-row items-start flex-1">
                    <View className="mr-3 mt-0.5">
                      <View className={`w-5 h-5 rounded-full border-2 justify-center items-center ${
                        !isPublic ? 'border-green-700' : 'border-gray-300'
                      }`}>
                        {!isPublic && <View className="w-2.5 h-2.5 rounded-full bg-green-700" />}
                      </View>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Ionicons 
                          name="lock-closed-outline" 
                          size={16} 
                          color="#374151" 
                        />
                        <Text className="text-base font-medium text-gray-700 ml-2">Privé</Text>
                      </View>
                      <Text className="text-sm text-gray-500 leading-5">
                        Alleen jij kunt dit recept zien in je persoonlijke collectie
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Public Option */}
              <TouchableOpacity
                className="mb-4"
                onPress={() => setIsPublic(true)}
              >
                <View className="flex-row items-start">
                  <View className="flex-row items-start flex-1">
                    <View className="mr-3 mt-0.5">
                      <View className={`w-5 h-5 rounded-full border-2 justify-center items-center ${
                        isPublic ? 'border-green-700' : 'border-gray-300'
                      }`}>
                        {isPublic && <View className="w-2.5 h-2.5 rounded-full bg-green-700" />}
                      </View>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Ionicons 
                          name="globe-outline" 
                          size={16} 
                          color="#374151" 
                        />
                        <Text className="text-base font-medium text-gray-700 ml-2">Openbaar</Text>
                      </View>
                      <Text className="text-sm text-gray-500 leading-5">
                        Iedereen kan dit recept bekijken en gebruiken
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 items-center"
                onPress={onClose}
              >
                <Text className="text-base font-medium text-gray-700">Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg bg-green-700 items-center"
                onPress={handleConfirm}
              >
                <Text className="text-base font-medium text-white">Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

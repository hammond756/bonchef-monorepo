import { Text, TextInput, TouchableOpacity, View } from "react-native";

const ImportRecipe = ({ url, text, onClose }: { url?: string, text?: string, onClose?: () => void }) => {
  return (
    <View>
      {/* Header with close button */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-900">Importeer van URL</Text>
      </View>
      
      {/* Description text */}
      <Text className="text-gray-700 mb-6 leading-5">
        Klik op bonchef! om het recept te importeren. We gaan op de achtergrond voor je
        aan de slag zodat jij door kan gaan met browsen.
      </Text>
      
      {/* Input field */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-900"
        placeholder="https://website.com/recept"
        value={url || ""}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      
      {/* Green button */}
      <TouchableOpacity className="bg-green-700 rounded-lg py-4 items-center" onPress={onClose}>
        <Text className="text-white font-bold text-lg">bonchef!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImportRecipe;
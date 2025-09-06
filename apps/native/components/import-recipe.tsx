import { supabase } from "@/lib/utils/supabase/client";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

interface ImportRecipeProps {
  sharedData: {
    url?: string
    text?: string
  },
  onClose: () => void
}

const ImportRecipe = ({ sharedData, onClose }: ImportRecipeProps) => {
  const checkmarkScale = useSharedValue(0);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUserName(user.user?.user_metadata.display_name ?? '');
    };
    fetchUserName();
  }, []);

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkmarkScale.value }],
    };
  });

  const handleImportComplete = () => {
    setShowCheckmark(true);
    // Animate checkmark in
    checkmarkScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    // Close extension after 500ms
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (showCheckmark) {
    return (
      <Animated.View style={checkmarkAnimatedStyle} className="items-center justify-center">
        <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center">
          <Ionicons name="checkmark" size={40} color="white" />
        </View>
      </Animated.View>
    );
  }

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
      
      {/* User name display */}
      {userName && <Text className="text-gray-600 mb-4">Hallo {userName}!</Text>}
      
      {/* Input field */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-900"
        placeholder="https://website.com/recept"
        value={sharedData.url || ""}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      
      {/* Green button */}
      <TouchableOpacity className="bg-green-700 rounded-lg py-4 items-center" onPress={handleImportComplete}>
        <Text className="text-white font-bold text-lg">bonchef!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImportRecipe;
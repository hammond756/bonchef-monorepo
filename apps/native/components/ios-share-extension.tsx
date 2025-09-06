import { supabase } from "@/lib/utils/supabase/client";
import Ionicons from '@expo/vector-icons/Ionicons';
import { close, type InitialProps } from "expo-share-extension";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import ImportRecipe from "./import-recipe";

export default function IOSShareExtension({ url, text }: InitialProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const checkmarkScale = useSharedValue(0);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Animate in when component mounts
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
    const fetchUserName = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUserName(user.user?.user_metadata.display_name ?? '');
    };
    fetchUserName();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

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
      close();
    }, 1200);
  };

  return (
    <Animated.View className="w-full h-full items-center justify-center p-16">
        {/* X icon in top right */}
        <TouchableOpacity 
          onPress={close}
          className="absolute top-8 right-8 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        
        {showCheckmark ? (
          <Animated.View style={checkmarkAnimatedStyle} className="items-center justify-center">
            <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
          </Animated.View>
        ) : (
          <>
            <Text>{userName}</Text>
            <ImportRecipe url={url} text={text} onClose={handleImportComplete} />
          </>
        )}
    </Animated.View>
  );
}

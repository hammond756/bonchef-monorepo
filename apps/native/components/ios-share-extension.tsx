import Ionicons from '@expo/vector-icons/Ionicons';
import { close, type InitialProps } from "expo-share-extension";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import ImportRecipe from "./import-recipe";

export default function IOSShareExtension({ url, text }: InitialProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Animate in when component mounts
    opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
  }, []);

  return (
    <Animated.View className="w-full h-full items-center justify-center p-16">
        {/* X icon in top right */}
        <TouchableOpacity 
          onPress={close}
          className="absolute top-8 right-8 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        
        <ImportRecipe sharedData={{ url, text }} onClose={close} />
    </Animated.View>
  );
}

import { View, Image, Text } from "react-native";
import { ActivityIndicator } from "react-native";

export function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../assets/images/splash-icon.png")}
        className="w-48 h-48 mb-8"
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#1E4D37" />
    </View>
  );
}

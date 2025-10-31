import { useState } from "react";
import { View, Text, Dimensions, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/ui/button";
import { onboardingStorage } from "@/lib/utils/mmkv/onboarding";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const onboardingData = [
    {
        title: "Verlies nooit meer recepten",
        image: require("@/assets/images/onboarding/onboarding_1.png"),
    },
    {
        title: "Verzamel recepten, uit elke hoek",
        image: require("@/assets/images/onboarding/onboarding_2.png"),
    },
    {
        title: "Scroll Socials & Share naar Bonchef",
        image: require("@/assets/images/onboarding/onboarding_3.png"),
    },
    {
        title: "Laat je inspireren door de community",
        image: require("@/assets/images/onboarding/onboarding_4.png"),
    },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const springConfig = { stiffness: 140, mass: 1, damping: 15 }

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      translateX.value = withSpring(-nextIndex * screenWidth, springConfig);
    } else {
      // Last screen - complete onboarding and redirect to signup
      onboardingStorage.markOnboardingComplete();
      router.replace("/signup");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      translateX.value = withSpring(-prevIndex * screenWidth, springConfig);
    }
  };

  const animateBackToCurrentIndex = () => {
    translateX.value = withSpring(-currentIndex * screenWidth, springConfig);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      translateX.value = -currentIndex * screenWidth + event.translationX;
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      
      const threshold = screenWidth * 0.3;
      const velocity = event.velocityX;
      
      if (event.translationX > threshold || velocity > 500) {
        // Swipe right - go back
        if (currentIndex > 0) {
          runOnJS(handleBack)();
        } else {
          runOnJS(animateBackToCurrentIndex)();
        }
      } else if (event.translationX < -threshold || velocity < -500) {
        // Swipe left - go forward
        if (currentIndex < onboardingData.length - 1) {
          runOnJS(handleNext)();
        } else {
          runOnJS(animateBackToCurrentIndex)();
        }
      } else {
        // Snap back to current position
        runOnJS(animateBackToCurrentIndex)();
      }
    });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });


  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <GestureDetector gesture={panGesture}>
        <Animated.View className="flex-1">
          <Animated.View 
            style={[
              containerStyle,
              {
                flexDirection: 'row',
                width: screenWidth * onboardingData.length,
              }
            ]}
          >
            {onboardingData.map((data, index) => (
              <View
                key={`onboarding-screen-${index + 1}`}
                className="items-center mt-10 px-10"
                style={{
                  width: screenWidth,
                  height: screenHeight,
                }}
              >
                <Text className="text-4xl font-bold font-lora text-gray-800 text-center">{data.title}</Text>
                <Image
                  source={data.image}
                  style={{
                    width: screenWidth * 0.8,
                    height: screenHeight * 0.8,
                    transform: [{ translateY: -50 }],
                  }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <View className="flex-row items-center justify-center my-8 px-6 h-20">
        {currentIndex < onboardingData.length - 1 && onboardingData.map((_, idx) => (
          <View
            key={`progress-dot-${idx + 1}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 6,
              backgroundColor: idx === currentIndex ? "#22c55e" : "#e5e7eb", // green for active, gray for inactive
            }}
          />
        ))}
        {currentIndex === onboardingData.length - 1 && (
          <Button
            title="Aan de slag"
            onPress={handleNext}
            className="w-full"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

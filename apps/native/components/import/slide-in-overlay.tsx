import { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, Dimensions, View, Platform, Animated } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import ReanimatedAnimated from 'react-native-reanimated';

interface SlideInOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Custom hook for keyboard animation
const useKeyboardAnimation = () => {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet';
        keyboardHeight.value = Math.max(event.height, 0);
      },
    },
    []
  );

  return { keyboardHeight };
};

export function SlideInOverlay({ isOpen, onClose, children }: SlideInOverlayProps) {
  const screenHeight = Dimensions.get('window').height;
  const trayHeight = screenHeight * 0.5; // 2/5 of screen height
  const [backgroundOpacity] = useState(new Animated.Value(0));
  
  // Get keyboard height for animation
  const { keyboardHeight } = useKeyboardAnimation();

  // Animate background opacity when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, backgroundOpacity]);

  // Create animated style for keyboard adjustment
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateY: -keyboardHeight.value 
        }
      ],
    };
  }, [keyboardHeight]);

  const handleBackgroundPress = () => {
    onClose();
  };

  return (
    <>
    {isOpen && <Animated.View 
      className="absolute inset-0"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        opacity: backgroundOpacity
      }}
    >
      <TouchableOpacity 
        className="flex-1" 
        onPress={handleBackgroundPress}
        activeOpacity={1}
      />
    </Animated.View>}
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Animated background overlay */}
        
        {/* Slide-up content */}
        <ReanimatedAnimated.View
          style={[
            {
              height: trayHeight,
            },
            animatedStyle
          ]}
          className="bg-white rounded-t-3xl shadow-2xl"
        >
          {children}
        </ReanimatedAnimated.View>
      </View>
    </Modal>
    </>
  );
}

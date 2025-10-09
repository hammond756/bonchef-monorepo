import { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
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
  const [slideAnimation] = useState(new Animated.Value(trayHeight));
  const [backgroundOpacity] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  
  // Get keyboard height for animation
  const { keyboardHeight } = useKeyboardAnimation();

  useEffect(() => {
    if (isOpen) {
      // Show modal and reset to initial position first, then animate in
      setModalVisible(true);
      slideAnimation.setValue(trayHeight);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Show background overlay after slide-in completes
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Hide background overlay immediately when slide-out starts
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      
      // Reset to visible position first, then animate out
      slideAnimation.setValue(0);
      Animated.timing(slideAnimation, {
        toValue: trayHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Hide modal after animation completes
        setModalVisible(false);
        // Reset to initial position after animation completes
        slideAnimation.setValue(trayHeight);
      });
    }
  }, [isOpen, slideAnimation, backgroundOpacity, trayHeight]);

  // Create animated style that combines slide animation with keyboard height
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
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        className="flex-1"
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
        <ReanimatedAnimated.View
          style={[
            {
              transform: [{ translateY: slideAnimation }],
              height: trayHeight,
            },
            animatedStyle
          ]}
          className="bg-white rounded-t-3xl shadow-2xl"
        >
          {children}
        </ReanimatedAnimated.View>
      </Animated.View>
    </Modal>
  );
}

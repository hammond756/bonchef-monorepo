import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';

interface SlideInOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SlideInOverlay({ isOpen, onClose, children }: SlideInOverlayProps) {
  const screenHeight = Dimensions.get('window').height;
  const trayHeight = screenHeight * 0.4; // 2/5 of screen height
  const [slideAnimation] = useState(new Animated.Value(trayHeight));

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: trayHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnimation, trayHeight]);

  const handleBackgroundPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <TouchableOpacity 
          className="flex-1" 
          onPress={handleBackgroundPress}
          activeOpacity={1}
        />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnimation }],
            height: trayHeight,
          }}
          className="bg-white rounded-t-3xl shadow-2xl"
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

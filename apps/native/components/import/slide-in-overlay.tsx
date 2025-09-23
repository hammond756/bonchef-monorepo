import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';

interface SlideInOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SlideInOverlay({ isOpen, onClose, children }: SlideInOverlayProps) {
  const screenHeight = Dimensions.get('window').height;
  const trayHeight = screenHeight * 0.5; // 2/5 of screen height
  const [slideAnimation] = useState(new Animated.Value(trayHeight));
  const [backgroundOpacity] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

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
        <Animated.View
          style={{
            transform: [{ translateY: slideAnimation }],
            height: trayHeight,
          }}
          className="bg-white rounded-t-3xl shadow-2xl"
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

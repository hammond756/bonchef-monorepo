import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  onAnimationComplete?: () => void;
}

export function AnimatedCheckmark({ 
  size = 80, 
  color = '#10B981', 
  backgroundColor = '#F0FDF4',
  onAnimationComplete 
}: AnimatedCheckmarkProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start the animation sequence
    const animationSequence = Animated.sequence([
      // First, scale up the background circle
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Then show the checkmark with a bounce effect
      Animated.parallel([
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      onAnimationComplete?.();
    });
  }, [scaleAnim, checkmarkOpacity, checkmarkScale, onAnimationComplete]);

  return (
    <View className="justify-center items-center">
      <Animated.View
        className="justify-center items-center shadow-sm"
        style={{
          width: size,
          height: size,
          backgroundColor,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Animated.View
          className="justify-center items-center"
          style={{
            opacity: checkmarkOpacity,
            transform: [{ scale: checkmarkScale }],
          }}
        >
          <Ionicons 
            name="checkmark" 
            size={size * 0.5} 
            color={color} 
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

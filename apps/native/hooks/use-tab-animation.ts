import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useTabAnimation({ width, nTabs, activeTab }: { 
  width: number, 
  nTabs: number, 
  activeTab: number 
}) {
  const tabWidth = width / nTabs;
  
  // Create animated values for each tab
  const animatedValues = useRef(
    Array.from({ length: nTabs }, () => new Animated.Value(0))
  ).current;

  // Initialize the first tab's underline on mount
  useEffect(() => {
    Animated.timing(animatedValues[0], {
      toValue: tabWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animatedValues, tabWidth]);

  // Animate when activeTab changes
  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) => 
      Animated.timing(animatedValue, {
        toValue: index === activeTab ? tabWidth : 0,
        duration: 300,
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start();
  }, [activeTab, animatedValues, tabWidth]);

  return {
    animatedValues,
    tabWidth,
  };
}

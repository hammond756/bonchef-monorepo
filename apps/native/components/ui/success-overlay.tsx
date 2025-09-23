import { useCallback } from 'react';
import { View, Modal } from 'react-native';
import { AnimatedCheckmark } from './animated-checkmark';
import { useSuccessAnimation } from '@/hooks/use-success-animation';

// Hook to use the success overlay
export function useSuccessOverlay(animationDuration?: number) {
  const { showAnimation, triggerSuccess, handleAnimationComplete } = useSuccessAnimation({
    animationDuration,
  });

  const SuccessOverlayComponent = useCallback(() => (
    <Modal
      visible={showAnimation}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <AnimatedCheckmark
          onAnimationComplete={handleAnimationComplete}
        />
      </View>
    </Modal>
  ), [showAnimation, handleAnimationComplete]);

  return {
    triggerSuccess,
    SuccessOverlayComponent,
  };
}

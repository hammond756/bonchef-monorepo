import { useState, useCallback } from 'react';

interface UseSuccessAnimationOptions {
  animationDuration?: number;
}

export function useSuccessAnimation({ 
  animationDuration = 1500 
}: UseSuccessAnimationOptions = {}) {
  const [showAnimation, setShowAnimation] = useState(false);

  const triggerSuccess = useCallback((onComplete?: () => void) => {
    setShowAnimation(true);
    
    // Hide animation and call onComplete after duration
    const timer = setTimeout(() => {
      setShowAnimation(false);
      onComplete?.();
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [animationDuration]);

  const handleAnimationComplete = useCallback(() => {
    // This is called when the checkmark animation finishes
    // We don't need to do anything here as the timer will handle the cleanup
  }, []);

  return {
    showAnimation,
    triggerSuccess,
    handleAnimationComplete,
  };
}

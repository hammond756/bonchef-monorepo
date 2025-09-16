import React, { useState } from 'react';
import { Animated, Dimensions, ScrollView } from 'react-native';
import { ImportOptions } from './import-options';
import { UrlImportForm } from './url-import-form';
import { TextImportForm } from './text-import-form';
import { SlideInOverlay } from './slide-in-overlay';

interface ImportTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'options' | 'url' | 'text' | 'photo' | 'dishcovery';

export function ImportTray({ isOpen, onClose }: ImportTrayProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('options');
  const [slideAnimation] = useState(new Animated.Value(0));

  const handleStepChange = (step: ImportStep) => {
    // Animate slide transition
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: -Dimensions.get('window').width,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentStep(step);
  };

  const handleBack = () => {
    handleStepChange('options');
  };

  const handleClose = () => {
    setCurrentStep('options');
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'options':
        return <ImportOptions onSelectMode={handleStepChange} onClose={handleClose} />;
      case 'url':
        return <UrlImportForm onBack={handleBack} onClose={handleClose} />;
      case 'text':
        return <TextImportForm onBack={handleBack} onClose={handleClose} />;
      default:
        return <ImportOptions onSelectMode={handleStepChange} onClose={handleClose} />;
    }
  };

  return (
    <SlideInOverlay isOpen={isOpen} onClose={handleClose}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Animated.View 
          style={{ 
            transform: [{ translateX: slideAnimation }],
            width: Dimensions.get('window').width,
            flex: 1,
          }}
        >
          {renderCurrentStep()}
        </Animated.View>
      </ScrollView>
    </SlideInOverlay>
  );
}

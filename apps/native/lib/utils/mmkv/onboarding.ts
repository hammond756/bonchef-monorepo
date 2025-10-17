import { storage } from "./storage";

const ONBOARDING_COMPLETED_KEY = 'bonchef_onboarding_completed';

export const onboardingStorage = {
  hasCompletedOnboarding: (): boolean => {
    return storage.getBoolean(ONBOARDING_COMPLETED_KEY) ?? false;
  },

  markOnboardingComplete: (): void => {
    storage.set(ONBOARDING_COMPLETED_KEY, true);
  },

  resetOnboarding: (): void => {
    storage.delete(ONBOARDING_COMPLETED_KEY);
  },
};

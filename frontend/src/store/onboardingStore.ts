import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  selectedTopics: string[];
  setCurrentStep: (step: number) => void;
  setSelectedTopics: (topics: string[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      selectedTopics: [],
      setCurrentStep: (step) => set({ currentStep: step }),
      setSelectedTopics: (topics) => set({ selectedTopics: topics }),
      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true, currentStep: 0 }),
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          currentStep: 0,
          selectedTopics: [],
        }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);

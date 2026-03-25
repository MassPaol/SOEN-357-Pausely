import { create } from 'zustand';

// Define the shape of state
interface AppState {
  hasCompletedOnboarding: boolean;
  username: string;
  // Actions
  setHasCompletedOnboarding: (value: boolean) => void;
  setUsername: (name: string) => void;
  resetPlayer: () => void;
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  username: '',

  // Implement actions
  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),

  setUsername: (name) => set({ username: name }),

  resetPlayer: () => set({ username: '', hasCompletedOnboarding: false }),
}));

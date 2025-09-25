// store/progress.ts
import { create } from "zustand";

type ProgressState = {
  lastShownDate: string | null;  // YYYY-MM-DD
  currentDay: number;            // 1 ~ 18
  setShown: (date: string) => void;
  nextDay: () => void;
};

export const useProgress = create<ProgressState>((set, get) => ({
  lastShownDate: null,
  currentDay: 1,
  setShown: (date) => set({ lastShownDate: date }),
  nextDay: () => set({ currentDay: Math.min(get().currentDay + 1, 18) }),
}));
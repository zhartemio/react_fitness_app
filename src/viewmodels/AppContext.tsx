import { createContext, ReactNode, useContext } from 'react';

import { useAppPreferences } from '@/src/viewmodels/useAppPreferences';
import { useWorkoutViewModel } from '@/src/viewmodels/useWorkoutViewModel';

const AppContext = createContext<ReturnType<typeof useAppController> | null>(null);

function useAppController() {
  const prefs = useAppPreferences();
  const workouts = useWorkoutViewModel();

  return { prefs, workouts };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppController();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

type ColorMode = 'standard' | 'protanopia' | 'deuteranopia' | 'tritanopia';

type AccessibilityPreferences = {
  colorMode: ColorMode;
  widerLetters: boolean;
  highContrast: boolean;
};

type AccessibilityContextValue = AccessibilityPreferences & {
  hydrated: boolean;
  setColorMode: (mode: ColorMode) => void;
  setWiderLetters: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
};

const STORAGE_KEY = 'consattentia-accessibility';
const defaults: AccessibilityPreferences = {
  colorMode: 'standard',
  widerLetters: false,
  highContrast: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const saved = JSON.parse(value) as Partial<AccessibilityPreferences>;
        setPreferences({ ...defaults, ...saved });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)).catch(() => undefined);
    }
  }, [hydrated, preferences]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      hydrated,
      setColorMode: (colorMode) => setPreferences((current) => ({ ...current, colorMode })),
      setWiderLetters: (widerLetters) => setPreferences((current) => ({ ...current, widerLetters })),
      setHighContrast: (highContrast) => setPreferences((current) => ({ ...current, highContrast })),
    }),
    [preferences, hydrated]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility precisa estar dentro de AccessibilityProvider.');
  return context;
}

export type { ColorMode };

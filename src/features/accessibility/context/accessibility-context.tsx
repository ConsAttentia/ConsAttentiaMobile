import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Platform } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

type ColorMode = 'standard' | 'protanopia' | 'deuteranopia' | 'tritanopia';
const colorModes: ColorMode[] = ['standard', 'protanopia', 'deuteranopia', 'tritanopia'];
const minTextScale = 0.9;
const maxTextScale = 1.3;

type AccessibilityPreferences = {
  colorMode: ColorMode;
  widerLetters: boolean;
  highContrast: boolean;
  alternateFont: boolean;
  textScale: number;
  reduceMotion: boolean;
};

type AccessibilityContextValue = AccessibilityPreferences & {
  hydrated: boolean;
  persistenceError: string | null;
  systemReduceMotion: boolean;
  shouldReduceMotion: boolean;
  setColorMode: (mode: ColorMode) => void;
  setWiderLetters: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setAlternateFont: (enabled: boolean) => void;
  setTextScale: (scale: number) => void;
  setReduceMotion: (enabled: boolean) => void;
};

const STORAGE_KEY = 'consattentia-accessibility';
const defaults: AccessibilityPreferences = {
  colorMode: 'standard',
  widerLetters: false,
  highContrast: false,
  alternateFont: false,
  textScale: 1,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const saved = JSON.parse(value) as Partial<AccessibilityPreferences>;
        const colorMode = colorModes.includes(saved.colorMode as ColorMode) ? saved.colorMode as ColorMode : defaults.colorMode;
        const textScale = typeof saved.textScale === 'number' && Number.isFinite(saved.textScale)
          ? Math.min(maxTextScale, Math.max(minTextScale, saved.textScale))
          : defaults.textScale;
        setPreferences({
          colorMode,
          widerLetters: typeof saved.widerLetters === 'boolean' ? saved.widerLetters : defaults.widerLetters,
          highContrast: typeof saved.highContrast === 'boolean' ? saved.highContrast : defaults.highContrast,
          alternateFont: typeof saved.alternateFont === 'boolean' ? saved.alternateFont : defaults.alternateFont,
          textScale,
          reduceMotion: typeof saved.reduceMotion === 'boolean' ? saved.reduceMotion : defaults.reduceMotion,
        });
      })
      .catch((error: unknown) => {
        console.error('Não foi possível carregar as preferências de acessibilidade.', error);
        setPersistenceError('Não foi possível carregar as preferências salvas neste dispositivo.');
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
        .then(() => setPersistenceError(null))
        .catch((error: unknown) => {
          console.error('Não foi possível salvar as preferências de acessibilidade.', error);
          setPersistenceError('Não foi possível salvar as preferências neste dispositivo.');
        });
    }
  }, [hydrated, preferences]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updatePreference = (event: MediaQueryListEvent) => setSystemReduceMotion(event.matches);
      void Promise.resolve(query.matches).then(setSystemReduceMotion);
      query.addEventListener('change', updatePreference);
      return () => query.removeEventListener('change', updatePreference);
    }

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(setSystemReduceMotion)
      .catch((error: unknown) => console.error('Não foi possível consultar a preferência de movimento reduzido do sistema.', error));

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => subscription.remove();
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      hydrated,
      persistenceError,
      systemReduceMotion,
      shouldReduceMotion: preferences.reduceMotion || systemReduceMotion,
      setColorMode: (colorMode) => setPreferences((current) => ({ ...current, colorMode })),
      setWiderLetters: (widerLetters) => setPreferences((current) => ({ ...current, widerLetters })),
      setHighContrast: (highContrast) => setPreferences((current) => ({ ...current, highContrast })),
      setAlternateFont: (alternateFont) => setPreferences((current) => ({ ...current, alternateFont })),
      setTextScale: (textScale) => setPreferences((current) => ({
        ...current,
        textScale: Math.min(maxTextScale, Math.max(minTextScale, textScale)),
      })),
      setReduceMotion: (reduceMotion) => setPreferences((current) => ({ ...current, reduceMotion })),
    }),
    [preferences, hydrated, persistenceError, systemReduceMotion]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility precisa estar dentro de AccessibilityProvider.');
  return context;
}

export type { ColorMode };

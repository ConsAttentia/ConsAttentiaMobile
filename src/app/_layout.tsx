import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { router, Stack, useSegments } from 'expo-router';

import { AccessibilityProvider } from '@/context/accessibility-context';
import { auth } from '@/lib/firebase';

export default function RootLayout() {
  const segments = useSegments();

  useEffect(() => {
    if (!auth) return;

    const publicRoutes = new Set(['', 'register']);
    const currentRoute = segments.join('/');
    const isPublicRoute = publicRoutes.has(currentRoute);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAuthenticated = Boolean(user);

      if (isAuthenticated && isPublicRoute) {
        router.replace('/home');
        return;
      }

      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/');
      }
    });

    return unsubscribe;
  }, [segments]);

  return (
    <AccessibilityProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AccessibilityProvider>
  );
}

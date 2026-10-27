import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { router, Stack, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthProvider } from '@/features/auth/context/auth-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AccessibilityProvider } from '@/features/accessibility/context/accessibility-context';
import { theme } from '@/shared/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts([
    {
      fontFamily: theme.typography.fontFamily.accessible,
      fontDefinitions: [
        { path: require('../../assets/fonts/AtkinsonHyperlegible-Regular.ttf'), weight: 400 },
        { path: require('../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'), weight: 700 },
      ],
    },
  ]);

  if (fontError) throw fontError;
  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <AccessibilityProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </AccessibilityProvider>
  );
}

function RootNavigator() {
  const segments = useSegments();
  const { user, loading } = useAuth();

  const isPublicRoute = segments.join('/') === '' || segments[0] === 'register';
  const routeBlocked = loading || (!user && !isPublicRoute) || (Boolean(user) && isPublicRoute);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) router.replace('/');
    if (user && isPublicRoute) router.replace('/home');
  }, [isPublicRoute, loading, user]);

  if (routeBlocked) return <View style={styles.loading} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.colors.background },
});

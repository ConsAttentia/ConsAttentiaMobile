import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, useAccessiblePalette } from '@/components/mobile-shell';
import { BottomNavigation } from '@/components/bottom-navigation';

const colors = {
  canvas: '#E6EDF3',
  green: '#2E9B5F',
  blue: '#2575FC',
  ink: '#203129',
  muted: '#687A72',
  white: '#FFFFFF',
  error: '#A13434',
  errorBackground: '#FCE9E7',
};

export { colors as authColors };

export function AuthFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.page}>
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.cornerTop} />
            <LinearGradient colors={gradientColors} start={{ x: 1, y: 0.5 }} end={{ x: 0, y: 0.5 }} style={styles.cornerBottom} />
            <Image accessibilityLabel="ConsAttentia" resizeMode="contain" source={require('../../assets/images/consattentia-logo.png')} style={styles.brandLogo} />
            <View style={[styles.formArea, { backgroundColor: palette.surface, borderColor: palette.border }]}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const palette = useAccessiblePalette();
  return (
    <View style={styles.heading}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
    </View>
  );
}

export function AuthField({ label, style, ...props }: TextInputProps & { label: string }) {
  const palette = useAccessiblePalette();
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: palette.text }]}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.background, borderColor: palette.border, color: palette.text }, style]} {...props} />
    </View>
  );
}

export function AuthButton({ label, busy, onPress }: { label: string; busy?: boolean; onPress: () => void }) {
  const gradientColors = getBrandGradientColors(useAccessiblePalette());

  return (
    <Pressable accessibilityRole="button" disabled={busy} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.disabled]}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.buttonGradient}>
        <Text style={styles.buttonText}>{busy ? 'Aguarde...' : label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function AuthMessage({ children }: { children: ReactNode }) {
  const palette = useAccessiblePalette();
  return <View accessibilityRole="alert" style={[styles.message, { backgroundColor: palette.dangerBackground }]}><Text style={[styles.messageText, { color: palette.danger }]}>{children}</Text></View>;
}

export function AuthLink({ children, onPress }: { children: string; onPress: () => void }) {
  const palette = useAccessiblePalette();
  return <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress}><Text style={[styles.link, { color: palette.accent }]}>{children}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, minHeight: 640, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 78, paddingBottom: 40, overflow: 'hidden' },
  cornerTop: { position: 'absolute', top: -86, left: -88, width: 200, height: 200, backgroundColor: colors.green, transform: [{ rotate: '45deg' }] },
  cornerBottom: { position: 'absolute', right: -98, bottom: -108, width: 210, height: 210, backgroundColor: colors.blue, transform: [{ rotate: '45deg' }] },
  brandLogo: { position: 'absolute', top: 52, width: 210, height: 90 },
  formArea: { width: '100%', maxWidth: 390, borderRadius: 18, padding: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: '#D9E2E8' },
  heading: { marginBottom: 24, gap: 6 },
  title: { color: colors.ink, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  fieldGroup: { gap: 7, marginBottom: 15 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  input: { width: '100%', minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: '#D6E0E4', backgroundColor: '#FAFCFD', paddingHorizontal: 14, color: colors.ink, fontSize: 16 },
  button: { minHeight: 50, marginTop: 7, borderRadius: 8, overflow: 'hidden' },
  buttonGradient: { minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  message: { marginTop: 14, padding: 12, borderRadius: 8, backgroundColor: colors.errorBackground },
  messageText: { color: colors.error, fontSize: 13, lineHeight: 18 },
  footer: { alignItems: 'center', marginTop: 18 },
  link: { paddingVertical: 10, color: colors.blue, fontSize: 14, fontWeight: '700' },
});

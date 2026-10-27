import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { AccessibleText as Text, useAccessibleInputTextStyle } from '@/features/accessibility/components/accessibility-text';
import { theme } from '@/shared/theme';

export interface AuthFrameProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFrame({ children, footer }: AuthFrameProps) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.background === theme.colors.highContrast.background ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.page}>
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.cornerTop} />
            <LinearGradient colors={gradientColors} start={{ x: 1, y: 0.5 }} end={{ x: 0, y: 0.5 }} style={styles.cornerBottom} />
            <Image accessibilityLabel="ConsAttentia" resizeMode="contain" source={require('../../../../assets/images/consattentia-logo.png')} style={styles.brandLogo} />
            <View style={[styles.formArea, { backgroundColor: palette.surface, borderColor: palette.border }]}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export interface AuthHeadingProps {
  title: string;
  subtitle: string;
}

export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  const palette = useAccessiblePalette();
  return (
    <View style={styles.heading}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
    </View>
  );
}

export interface AuthFieldProps extends TextInputProps {
  label: string;
}

export function AuthField({ label, style, ...props }: AuthFieldProps) {
  const palette = useAccessiblePalette();
  const accessibleTextStyle = useAccessibleInputTextStyle(16);
  const [focused, setFocused] = useState(false);
  const { onFocus, onBlur, ...inputProps } = props;
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: palette.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={palette.muted}
        style={[
          styles.input,
          accessibleTextStyle,
          {
            backgroundColor: palette.background,
            borderColor: focused ? palette.accent : palette.border,
            borderWidth: focused ? 2 : 1,
            color: palette.text,
          },
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

export interface AuthButtonProps {
  label: string;
  busy?: boolean;
  onPress: () => void;
}

export function AuthButton({ label, busy, onPress }: AuthButtonProps) {
  const gradientColors = getBrandGradientColors(useAccessiblePalette());

  return (
    <Pressable accessibilityRole="button" disabled={busy} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.disabled]}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.buttonGradient}>
        <Text style={styles.buttonText}>{busy ? 'Aguarde...' : label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export interface AuthMessageProps {
  children: ReactNode;
}

export function AuthMessage({ children }: AuthMessageProps) {
  const palette = useAccessiblePalette();
  return <View accessibilityRole="alert" style={[styles.message, { backgroundColor: palette.dangerBackground }]}><Text style={[styles.messageText, { color: palette.danger }]}>{children}</Text></View>;
}

export interface AuthLinkProps {
  children: string;
  onPress: () => void;
}

export function AuthLink({ children, onPress }: AuthLinkProps) {
  const palette = useAccessiblePalette();
  return <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress}><Text style={[styles.link, { color: palette.accent }]}>{children}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.authCanvas },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, minHeight: theme.layout.authPageMinHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[24], paddingTop: theme.spacing[78], paddingBottom: theme.spacing[40], overflow: 'hidden' },
  cornerTop: { position: 'absolute', top: -theme.spacing[86], left: -theme.spacing[88], width: theme.sizes[200], height: theme.sizes[200], backgroundColor: theme.colors.brand.green, transform: [{ rotate: '45deg' }] },
  cornerBottom: { position: 'absolute', right: -theme.spacing[98], bottom: -theme.spacing[108], width: theme.sizes[210], height: theme.sizes[210], backgroundColor: theme.colors.brand.blue, transform: [{ rotate: '45deg' }] },
  brandLogo: { position: 'absolute', top: theme.spacing[52], width: theme.sizes[210], height: theme.sizes[90] },
  formArea: { width: '100%', maxWidth: theme.layout.authFormMaxWidth, borderRadius: theme.radii[18], padding: theme.spacing[24], backgroundColor: theme.colors.white, borderWidth: theme.sizes[1], borderColor: theme.colors.authFormBorder },
  heading: { marginBottom: theme.spacing[24], gap: theme.spacing[6] },
  title: { color: theme.colors.text, fontSize: theme.typography.fontSize[26], lineHeight: theme.typography.lineHeight[32], fontWeight: '700' },
  subtitle: { color: theme.colors.muted, fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[20] },
  fieldGroup: { gap: theme.spacing[7], marginBottom: theme.spacing[15] },
  fieldLabel: { color: theme.colors.text, fontSize: theme.typography.fontSize[13], fontWeight: '600' },
  input: { width: '100%', minHeight: theme.sizes[50], borderRadius: theme.radii[8], borderWidth: theme.sizes[1], borderColor: theme.colors.authInputBorder, backgroundColor: theme.colors.authInput, paddingHorizontal: theme.spacing[14], color: theme.colors.text, fontSize: theme.typography.fontSize[16] },
  button: { minHeight: theme.sizes[50], marginTop: theme.spacing[7], borderRadius: theme.radii[8], overflow: 'hidden' },
  buttonGradient: { minHeight: theme.sizes[50], alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  buttonText: { color: theme.colors.white, fontSize: theme.typography.fontSize[16], fontWeight: '700' },
  message: { marginTop: theme.spacing[14], padding: theme.spacing[12], borderRadius: theme.radii[8], backgroundColor: theme.colors.dangerBackground },
  messageText: { color: theme.colors.danger, fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[18] },
  footer: { alignItems: 'center', marginTop: theme.spacing[18] },
  link: { paddingVertical: theme.spacing[10], color: theme.colors.brand.blue, fontSize: theme.typography.fontSize[14], fontWeight: '700' },
});

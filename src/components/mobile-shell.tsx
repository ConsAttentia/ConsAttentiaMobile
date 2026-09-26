import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAccessibility, type ColorMode } from '@/context/accessibility-context';
import { getAuthErrorMessage, signOutUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';

const modes: { key: ColorMode; label: string; note: string }[] = [
  { key: 'standard', label: 'Padrão', note: 'Cores originais' },
  { key: 'protanopia', label: 'Protanopia', note: 'Paleta alternativa A' },
  { key: 'deuteranopia', label: 'Deuteranopia', note: 'Paleta alternativa B' },
  { key: 'tritanopia', label: 'Tritanopia', note: 'Paleta alternativa C' },
];

export function useAccessiblePalette() {
  const { colorMode, highContrast, widerLetters } = useAccessibility();
  const primary = colorMode === 'standard' ? '#176E55' : colorMode === 'protanopia' ? '#355C9A' : colorMode === 'deuteranopia' ? '#176D73' : '#9B5B26';
  return {
    background: highContrast ? '#000000' : '#EDF2F1',
    surface: highContrast ? '#101010' : '#FFFFFF',
    text: highContrast ? '#FFFFFF' : '#203129',
    muted: highContrast ? '#E2E2E2' : '#687A72',
    primary: highContrast ? '#FFE66D' : primary,
    accent: highContrast ? '#77DDFF' : '#3F87BD',
    border: highContrast ? '#FFFFFF' : '#D8E4E1',
    wideLetters: widerLetters ? 1.1 : 0,
  };
}

export function MobileFrame({
  children,
  onLogout,
  scroll = true,
}: {
  children: ReactNode;
  onLogout?: () => void | Promise<void>;
  scroll?: boolean;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const palette = useAccessiblePalette();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flexContent]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.background === '#000000' ? 'light' : 'light'} />
      <View style={[styles.header, { backgroundColor: palette.primary }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Início" onPress={() => router.replace('/home')}>
          <Image
            accessibilityLabel="ConsAttentia"
            resizeMode="contain"
            source={require('../../assets/images/consattentia/logo-claro.png')}
            style={styles.logo}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações de acessibilidade"
          onPress={() => setSettingsOpen(true)}
          style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>
      </View>
      {content}
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
}

function SettingsModal({
  visible,
  onClose,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
}) {
  const accessibility = useAccessibility();
  const palette = useAccessiblePalette();

  async function handleLogout() {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await signOutUser();
        router.replace('/');
      }
      onClose();
    } catch (error) {
      Alert.alert('Não foi possível sair', getAuthErrorMessage(error));
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Fechar configurações" onPress={onClose} style={styles.scrim} />
        <View style={[styles.sheet, { backgroundColor: palette.background }]}>
          <View style={[styles.sheetHeader, { backgroundColor: palette.primary }]}>
            <View>
              <Text style={styles.sheetEyebrow}>PERSONALIZE SUA EXPERIÊNCIA</Text>
              <Text style={styles.sheetTitle}>Acessibilidade</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Paleta de cores</Text>
            <Text style={[styles.helper, { color: palette.muted }]}>Escolha uma paleta alternativa para os elementos da interface.</Text>
            {modes.map((mode) => {
              const active = accessibility.colorMode === mode.key;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  key={mode.key}
                  onPress={() => accessibility.setColorMode(mode.key)}
                  style={[styles.modeOption, { borderColor: active ? palette.primary : palette.border, backgroundColor: palette.surface }]}>
                  <View style={[styles.radio, { borderColor: active ? palette.primary : palette.muted }]}>
                    {active ? <View style={[styles.radioDot, { backgroundColor: palette.primary }]} /> : null}
                  </View>
                  <View style={styles.modeCopy}>
                    <Text style={[styles.modeLabel, { color: palette.text }]}>{mode.label}</Text>
                    <Text style={[styles.helper, { color: palette.muted }]}>{mode.note}</Text>
                  </View>
                </Pressable>
              );
            })}
            <SettingToggle
              label="Espaçamento entre letras"
              value={accessibility.widerLetters}
              onValueChange={accessibility.setWiderLetters}
              palette={palette}
            />
            <SettingToggle
              label="Alto contraste"
              value={accessibility.highContrast}
              onValueChange={accessibility.setHighContrast}
              palette={palette}
            />
            {onLogout || auth ? (
              <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sair e voltar para o login</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SettingToggle({
  label,
  value,
  onValueChange,
  palette,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  palette: ReturnType<typeof useAccessiblePalette>;
}) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.modeLabel, styles.toggleLabel, { color: palette.text }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor={value ? '#FFFFFF' : '#F3F4F4'}
        trackColor={{ false: '#AEBBB6', true: palette.primary }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 230, height: 62 },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  menuLine: { width: 20, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36, gap: 20 },
  flexContent: { flex: 1 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,32,35,0.55)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
  sheetHeader: { minHeight: 104, paddingHorizontal: 22, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetEyebrow: { color: '#D9F2DF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sheetTitle: { marginTop: 6, color: '#FFFFFF', fontSize: 23, fontWeight: '700' },
  closeButton: { width: 38, height: 38, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFFFFF', fontSize: 25, lineHeight: 28 },
  sheetContent: { padding: 20, paddingBottom: 36, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  helper: { fontSize: 12, lineHeight: 17 },
  modeOption: { minHeight: 60, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  modeCopy: { flex: 1, gap: 2 },
  modeLabel: { fontSize: 14, fontWeight: '700' },
  toggleRow: { minHeight: 58, marginTop: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { flex: 1, paddingRight: 12 },
  logoutButton: { marginTop: 10, minHeight: 48, borderWidth: 1, borderColor: '#D36464', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F5' },
  logoutText: { color: '#A53B3B', fontSize: 14, fontWeight: '700' },
});

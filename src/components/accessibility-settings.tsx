import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAccessiblePalette } from '@/components/mobile-shell';
import { useAccessibility, type ColorMode } from '@/context/accessibility-context';

const modes: { key: ColorMode; label: string; description: string }[] = [
  { key: 'standard', label: 'Padrão', description: 'Cores originais' },
  { key: 'protanopia', label: 'Protanopia', description: 'Azul e âmbar, sem depender de vermelho e verde' },
  { key: 'deuteranopia', label: 'Deuteranopia', description: 'Azul e vermelhão com contraste reforçado' },
  { key: 'tritanopia', label: 'Tritanopia', description: 'Magenta e verde-azulado, evitando azul e amarelo' },
];

export function AccessibilitySettings() {
  const accessibility = useAccessibility();
  const palette = useAccessiblePalette();

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Acessibilidade</Text>
        <Text style={[styles.helper, { color: palette.muted }]}>Personalize cores, contraste e leitura.</Text>
      </View>
      <View style={styles.options}>
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
                <Text style={[styles.helper, { color: palette.muted }]}>{mode.description}</Text>
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
      </View>
    </View>
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
  content: { gap: 12 },
  heading: { gap: 4 },
  sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  helper: { fontSize: 12, lineHeight: 18 },
  options: { gap: 10 },
  modeOption: { minHeight: 64, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, flexShrink: 0, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  modeCopy: { flex: 1, minWidth: 0, gap: 2 },
  modeLabel: { fontSize: 14, lineHeight: 19, fontWeight: '700' },
  toggleRow: { minHeight: 58, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleLabel: { flex: 1, minWidth: 0 },
});
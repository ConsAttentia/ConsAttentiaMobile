import { theme } from '@/shared/theme';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { useAccessibility, type ColorMode } from '@/features/accessibility/context/accessibility-context';

interface ColorModeOption {
  key: ColorMode;
  label: string;
  description: string;
}

interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  palette: ReturnType<typeof useAccessiblePalette>;
}

const modes: ColorModeOption[] = [
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
        <Text style={[styles.helper, { color: palette.muted }]}>Ajuste cores, leitura e movimento para sua preferência.</Text>
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
        <SettingToggle
          label="Fonte alternativa"
          description="Usa a fonte local Atkinson Hyperlegible, desenhada para facilitar a leitura."
          value={accessibility.alternateFont}
          onValueChange={accessibility.setAlternateFont}
          palette={palette}
        />
        <View style={[styles.scaleRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.toggleCopy}>
            <Text style={[styles.modeLabel, { color: palette.text }]}>Tamanho do texto</Text>
            <Text style={[styles.helper, { color: palette.muted }]}>Ajuste de 90% a 130%</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Diminuir tamanho do texto"
            accessibilityState={{ disabled: accessibility.textScale <= 0.9 }}
            disabled={accessibility.textScale <= 0.9}
            onPress={() => accessibility.setTextScale(accessibility.textScale - 0.1)}
            style={[styles.scaleButton, { borderColor: palette.primary }]}
          >
            <Text style={[styles.scaleButtonText, { color: palette.primary }]}>A−</Text>
          </Pressable>
          <Text accessibilityLabel={`Tamanho do texto ${Math.round(accessibility.textScale * 100)} por cento`} style={[styles.scaleValue, { color: palette.text }]}>
            {Math.round(accessibility.textScale * 100)}%
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aumentar tamanho do texto"
            accessibilityState={{ disabled: accessibility.textScale >= 1.3 }}
            disabled={accessibility.textScale >= 1.3}
            onPress={() => accessibility.setTextScale(accessibility.textScale + 0.1)}
            style={[styles.scaleButton, { borderColor: palette.primary }]}
          >
            <Text style={[styles.scaleButtonText, { color: palette.primary }]}>A+</Text>
          </Pressable>
        </View>
        <SettingToggle
          label="Reduzir animações"
          description={accessibility.systemReduceMotion
            ? 'Ativado pela preferência de movimento reduzido do dispositivo.'
            : 'Reduz transições e movimentos não essenciais.'}
          value={accessibility.shouldReduceMotion}
          onValueChange={accessibility.setReduceMotion}
          disabled={accessibility.systemReduceMotion}
          palette={palette}
        />
      </View>
      {accessibility.persistenceError ? (
        <Text accessibilityRole="alert" style={[styles.helper, { color: palette.danger }]}>
          {accessibility.persistenceError}
        </Text>
      ) : null}
    </View>
  );
}

function SettingToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  palette,
}: SettingToggleProps) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.modeLabel, styles.toggleLabel, { color: palette.text }]}>{label}</Text>
        {description ? <Text style={[styles.helper, { color: palette.muted }]}>{description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={value ? theme.colors.white : theme.colors.disabledThumb}
        trackColor={{ false: theme.colors.switchTrack, true: palette.background === theme.colors.highContrast.background ? theme.colors.highContrast.gradient : palette.primary }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[12] },
  heading: { gap: theme.spacing[4] },
  sectionTitle: { fontSize: theme.typography.fontSize[17], lineHeight: theme.typography.lineHeight[23], fontWeight: '700' },
  helper: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[18] },
  options: { gap: theme.spacing[10] },
  modeOption: { minHeight: theme.sizes[64], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], paddingHorizontal: theme.spacing[12], paddingVertical: theme.spacing[10], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] },
  radio: { width: theme.sizes[20], height: theme.sizes[20], flexShrink: 0, borderWidth: theme.sizes[2], borderRadius: theme.radii[10], alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: theme.sizes[10], height: theme.sizes[10], borderRadius: theme.radii[5] },
  modeCopy: { flex: 1, minWidth: theme.sizes[0], gap: theme.spacing[2] },
  modeLabel: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[19], fontWeight: '700' },
  toggleRow: { minHeight: theme.sizes[58], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], paddingHorizontal: theme.spacing[12], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[12] },
  toggleLabel: { flex: 1, minWidth: theme.sizes[0] },
  toggleCopy: { flex: 1, minWidth: theme.sizes[0], gap: theme.spacing[2] },
  scaleRow: { minHeight: theme.sizes[64], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], paddingHorizontal: theme.spacing[10], paddingVertical: theme.spacing[8], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[8] },
  scaleButton: { width: theme.sizes[44], height: theme.sizes[44], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center' },
  scaleButtonText: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  scaleValue: { minWidth: theme.sizes[42], fontSize: theme.typography.fontSize[13], fontWeight: '700', textAlign: 'center' },
});
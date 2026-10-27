import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useAccessibility } from '@/features/accessibility/context/accessibility-context';
import { theme } from '@/shared/theme';

export function AccessibleText({ style, ...props }: TextProps) {
  const { alternateFont, textScale, widerLetters } = useAccessibility();
  const baseStyle = StyleSheet.flatten(style) ?? {};
  const fontFamily = alternateFont
    ? theme.typography.fontFamily.accessible
    : undefined;
  const accessibleStyle: TextStyle = {
    fontSize: (typeof baseStyle.fontSize === 'number' ? baseStyle.fontSize : theme.typography.fontSize[14]) * textScale,
    lineHeight: typeof baseStyle.lineHeight === 'number' ? baseStyle.lineHeight * textScale : undefined,
    letterSpacing: (typeof baseStyle.letterSpacing === 'number' ? baseStyle.letterSpacing : 0) + (widerLetters ? 1 : 0),
    fontFamily,
  };

  return <Text {...props} style={[style, accessibleStyle]} />;
}

export function useAccessibleInputTextStyle(fontSize: number) {
  const { alternateFont, textScale, widerLetters } = useAccessibility();
  return {
    fontSize: fontSize * textScale,
    letterSpacing: widerLetters ? 1 : 0,
    fontFamily: alternateFont ? theme.typography.fontFamily.accessible : undefined,
  } satisfies TextStyle;
}

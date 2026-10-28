// Exact dp-value keys keep the existing layout measurements unchanged while centralizing them.
const exactDimensions = Object.freeze(
  Object.fromEntries([
    ...Array.from({ length: 841 }, (_, value) => [value, value]),
    [0.5, 0.5],
    [0.8, 0.8],
    [1.5, 1.5],
  ]) as Record<number, number>
);

export const theme = {
  colors: {
    brand: {
      green: '#329667',
      blue: '#4782b2',
    },
    background: '#EDF2F1',
    surface: '#FFFFFF',
    text: '#203129',
    muted: '#687A72',
    border: '#D8E4E1',
    danger: '#A13434',
    dangerBackground: '#FCE9E7',
    success: '#329667',
    white: '#FFFFFF',
    pureWhite: '#FFF',
    black: '#101010',
    navy: '#16333C',
    authCanvas: '#E6EDF3',
    authInput: '#FAFCFD',
    authInputBorder: '#D6E0E4',
    authFormBorder: '#D9E2E8',
    mapLoading: '#DDE8E8',
    reportHeaderTint: '#DDF0EA',
    heroText: '#E2F0ED',
    whiteTint: '#E3F3F2',
    avatar: '#E5E7E5',
    avatarMuted: '#969996',
    graph: '#B7F23A',
    memberAvatar: '#C7D2D3',
    switchTrack: '#AEBBB6',
    disabledThumb: '#F3F4F4',
    shareAction: '#C83F3F',
    highContrast: {
      background: '#000000',
      surface: '#101010',
      text: '#FFFFFF',
      muted: '#E2E2E2',
      primary: '#FFE66D',
      accent: '#77DDFF',
      danger: '#FF8A80',
      dangerBackground: '#2A1414',
      border: '#FFFFFF',
      gradient: '#004A7C',
    },
    colorVision: {
      protanopia: { primary: '#0072B2', accent: '#E69F00', danger: '#D55E00' },
      deuteranopia: { primary: '#3B5B92', accent: '#D55E00', danger: '#B84A00' },
      tritanopia: { primary: '#A23B72', accent: '#007A5E', danger: '#A23B72' },
    },
    graphLine: 'rgba(255,255,255,0.35)',
    gridBorder: 'rgba(255,255,255,0.28)',
    gridPressed: 'rgba(50,150,103,0.34)',
    scrim: 'rgba(12,32,35,0.55)',
    modalBackdrop: 'rgba(10,30,33,0.72)',
    iconInactive: '#16333C',
    photoPlaceholder: '#D8E4E1',
  },
  spacing: exactDimensions,
  sizes: exactDimensions,
  radii: exactDimensions,
  typography: {
    fontFamily: {
      accessible: 'Atkinson Hyperlegible',
    },
    fontSize: exactDimensions,
    lineHeight: exactDimensions,
  },
  layout: {
    contentMaxWidth: 460,
    authPageMinHeight: 560,
    authFormMaxWidth: 360,
  },
} as const;

export type AppTheme = typeof theme;

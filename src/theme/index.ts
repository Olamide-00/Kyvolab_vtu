// Single source of truth for the app's look. Screens should import from here
// instead of declaring their own color constants.
//
// Monochrome + minimal: black, white and a neutral grey ramp. Emphasis
// comes from contrast and weight, not hue.

export const PALETTE = {
  black: "#0A0A0A",
  gray900: "#111111",
  gray800: "#242424",
  gray700: "#2B2B2B",
  gray600: "#525252",
  gray500: "#737373",
  gray400: "#9A9A9A",
  gray300: "#C7C7C7",
  gray200: "#E2E2E2",
  gray100: "#EFEFEF",
  gray50: "#F7F7F7",
  white: "#FFFFFF",
};

export const THEME = {
  primary: PALETTE.gray800,
  primaryDeep: PALETTE.gray600,
  primaryDarkest: PALETTE.gray900,
  primarySoft: PALETTE.gray100,
  primaryTint: PALETTE.gray50,
  primaryMuted: PALETTE.gray300,

  accent: PALETTE.gray200,
  accentDeep: PALETTE.gray300,
  accentSoft: PALETTE.gray100,

  bg: PALETTE.gray50,
  surface: PALETTE.white,
  border: PALETTE.gray200,

  text: PALETTE.gray900,
  textSecondary: PALETTE.gray600,
  textMuted: PALETTE.gray400,
  onPrimary: PALETTE.white,
  onPrimaryMuted: "rgba(255,255,255,0.6)",

  // Status stays monochrome too: success reads as solid black, failure
  // and warnings as mid-grey. Labels ("Success", "Failed") carry meaning.
  success: PALETTE.gray900,
  successSoft: PALETTE.gray100,
  error: PALETTE.gray500,
  errorSoft: PALETTE.gray100,
  warning: PALETTE.gray600,
  warningSoft: PALETTE.gray100,
  info: PALETTE.gray600,
};

// Swap these family names when the new typeface is installed; every
// component reads fonts from here.
export const FONTS = {
  regular: "Tinos-Regular",
  medium: "Tinos-Regular",
  semibold: "Tinos-Bold",
  bold: "Tinos-Bold",
};

export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  hero: 24,
  pill: 999,
};

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  gutter: 20,
};

// Kept deliberately faint — minimal surfaces separate by tone and hairline
// borders, not by depth.
export const SHADOW = {
  card: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  raised: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  accent: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

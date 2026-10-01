// Text.tsx
import React from "react";
import {
  Text as RNText,
  TextStyle,
  StyleProp,
  TextProps as RNTextProps,
  Dimensions,
  PixelRatio,
} from "react-native";
import { FONTS, THEME } from "../../theme";

export type TextVariant = "regular" | "bold" | "semibold" | "light";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export interface TextProps extends RNTextProps {
  children: React.ReactNode;
  size?: TextSize;
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}

const BASE_WIDTH = 375;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / BASE_WIDTH;

function normalize(size: number): number {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const sizeMap: Record<TextSize, number> = {
  xs: normalize(8),
  sm: normalize(10),
  md: normalize(13),
  lg: normalize(16),
  xl: normalize(20),
  "2xl": normalize(24),
  "3xl": normalize(30),
  "4xl": normalize(36),
};

const variantMap: Record<TextVariant, TextStyle> = {
  regular: { fontFamily: FONTS.regular },
  bold: { fontFamily: FONTS.bold },
  semibold: { fontFamily: FONTS.semibold },
  light: { fontFamily: FONTS.regular },
};

export const Text: React.FC<TextProps> = ({
  children,
  size = "md",
  variant = "regular",
  color = THEME.text,
  center = false,
  style,
  ...rest
}) => {
  const textStyle: TextStyle = {
    fontSize: sizeMap[size],
    color,
    textAlign: center ? "center" : "left",
    ...variantMap[variant],
  };

  return (
    <RNText {...rest} allowFontScaling={false} style={[textStyle, style]}>
      {children}
    </RNText>
  );
};

type TextWithFontFamilyProps = TextProps & { fontFamily?: string };

export const TextWithFontFamily: React.FC<TextWithFontFamilyProps> = ({
  children,
  size = "md",
  variant = "regular",
  color = THEME.text,
  center = false,
  fontFamily,
  style,
  ...rest
}) => {
  const textStyle: TextStyle = {
    fontSize: sizeMap[size],
    color,
    textAlign: center ? "center" : "left",
    fontFamily: fontFamily ?? (variantMap[variant].fontFamily as string),
  };

  return (
    <RNText {...rest} allowFontScaling={false} style={[textStyle, style]}>
      {children}
    </RNText>
  );
};

export default Text;

// Btn.tsx
import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Text, TextProps } from "./txt";
import { RADIUS, SHADOW, THEME } from "../../theme";

export type BtnVariant = "primary" | "secondary" | "outline" | "ghost";
export type BtnSize = "sm" | "md" | "lg" | "xl";

export interface BtnProps extends TouchableOpacityProps {
  /** Button text content */
  title: string;
  /** Button variant style */
  variant?: BtnVariant;
  /** Button size */
  size?: BtnSize;
  /** Show loading state */
  loading?: boolean;
  /** Disable button */
  disabled?: boolean;
  /** Icon component to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon component to display on the right */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom button style */
  buttonStyle?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Custom text props */
  textProps?: Omit<TextProps, "children">;
  /** Loading indicator color */
  loadingColor?: string;
  /** Rounded button */
  rounded?: boolean;
}

/**
 * A customizable Button component with multiple variants and states
 *
 * @example
 * <Btn
 *   title="Submit"
 *   variant="primary"
 *   onPress={() => console.log('Pressed')}
 * />
 */
export const Btn: React.FC<BtnProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  buttonStyle,
  textStyle,
  textProps = {},
  loadingColor,
  rounded = false,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: THEME.primary,
          ...(isDisabled ? {} : SHADOW.card),
        };
      case "secondary":
        return {
          backgroundColor: THEME.accent,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: THEME.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  // Get size styles
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: rounded ? RADIUS.pill : RADIUS.sm,
        };
      case "md":
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: rounded ? RADIUS.pill : RADIUS.lg,
        };
      case "lg":
        return {
          paddingVertical: 16,
          paddingHorizontal: 28,
          borderRadius: rounded ? RADIUS.pill : RADIUS.lg,
        };
      case "xl":
        return {
          paddingVertical: 18,
          paddingHorizontal: 36,
          borderRadius: rounded ? RADIUS.pill : RADIUS.lg,
        };
      default:
        return {};
    }
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return THEME.onPrimary;
      case "secondary":
        return THEME.primaryDarkest;
      case "outline":
        return THEME.primary;
      case "ghost":
        return THEME.primary;
      default:
        return THEME.onPrimary;
    }
  };

  // Get text size based on button size
  const getTextSize = (): TextProps["size"] => {
    switch (size) {
      case "sm":
        return "sm";
      case "md":
        return "md";
      case "lg":
        return "lg";
      case "xl":
        return "xl";
      default:
        return "md";
    }
  };

  // Get text variant based on button size
  const getTextVariant = (): TextProps["variant"] => {
    switch (size) {
      case "sm":
        return "semibold";
      case "md":
        return "bold";
      case "lg":
        return "semibold";
      case "xl":
        return "bold";
      default:
        return "regular";
    }
  };

  const buttonStyles: ViewStyle = {
    ...getVariantStyle(),
    ...getSizeStyle(),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: isDisabled ? 0.4 : 1,
    width: fullWidth ? "100%" : undefined,
  };

  // Determine loading color if not provided
  const getLoadingColor = () => {
    if (loadingColor) return loadingColor;
    return getTextColor();
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, styles.base, buttonStyle, style]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoadingColor()} />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            size={getTextSize()}
            variant={getTextVariant()}
            color={getTextColor()}
            style={textStyle}
            {...textProps}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Btn;

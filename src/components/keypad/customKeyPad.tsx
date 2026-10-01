import React, { useRef } from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Vibration,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "../common/txt";
import { FONTS, THEME } from "../../theme";

interface CustomKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  showForgotPin?: boolean;
  onForgotPin?: () => void;
  submitIcon?: keyof typeof Ionicons.glyphMap;
  submitColor?: string;
  vibrate?: boolean;
  showSubmit?: boolean;
  disabled?: boolean;
}

// Every key manages its own press animation: a quick shrink plus a
// grey fill, so presses feel tactile without any colour.
function AnimatedKey({
  onPress,
  children,
  style,
  vibrate,
  disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  vibrate: boolean;
  disabled?: boolean;
}) {
  const press = useRef(new Animated.Value(0)).current;

  const animate = (to: number) =>
    Animated.spring(press, {
      toValue: to,
      speed: to ? 40 : 18,
      bounciness: to ? 0 : 8,
      useNativeDriver: false, // backgroundColor is animated
    }).start();

  const handlePress = () => {
    if (disabled) return;
    if (vibrate) Vibration.vibrate(8);
    onPress();
  };

  const scale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const backgroundColor = press.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.surface, THEME.accent],
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={() => animate(1)}
      onPressOut={() => animate(0)}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[style, { backgroundColor, transform: [{ scale }] }]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const CustomKeypad: React.FC<CustomKeypadProps> = ({
  onKeyPress,
  onDelete,
  onSubmit,
  showForgotPin = true,
  onForgotPin,
  submitIcon = "arrow-forward",
  submitColor = THEME.primary,
  vibrate = true,
  showSubmit = true,
  disabled = false,
}) => {
  const renderKey = (value: string) => (
    <AnimatedKey
      key={value}
      style={styles.key}
      onPress={() => onKeyPress(value)}
      vibrate={vibrate}
      disabled={disabled}
    >
      <Text style={styles.keyText}>{value}</Text>
    </AnimatedKey>
  );

  return (
    <View style={styles.container}>
      {showForgotPin && (
        <View style={styles.forgotPinContainer}>
          <Text style={styles.forgotPinText} onPress={onForgotPin}>
            Forgot PIN?
          </Text>
        </View>
      )}

      <View style={styles.keypad}>
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
        ].map((row) => (
          <View key={row.join("")} style={styles.row}>
            {row.map(renderKey)}
          </View>
        ))}

        <View style={styles.row}>
          {showSubmit ? (
            <AnimatedKey
              style={[styles.key, { backgroundColor: submitColor }]}
              onPress={onSubmit}
              vibrate={vibrate}
              disabled={disabled}
            >
              <Ionicons name={submitIcon} size={22} color={THEME.onPrimary} />
            </AnimatedKey>
          ) : (
            // Keeps the grid aligned when there's nothing to submit
            // (e.g. a PIN screen that auto-submits at 4 digits)
            <View style={[styles.key, styles.blank]} pointerEvents="none" />
          )}

          {renderKey("0")}

          <TouchableWithoutFeedback
            onPress={() => {
              if (disabled) return;
              if (vibrate) Vibration.vibrate(8);
              onDelete();
            }}
          >
            <View style={[styles.key, styles.blank]}>
              <Ionicons name="backspace-outline" size={24} color={THEME.text} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
};

// Slightly smaller keys on short screens (iPhone SE-class)
const KEY_SIZE = Dimensions.get("window").height < 700 ? 62 : 72;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 28,
  },
  forgotPinContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPinText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  keypad: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  blank: {
    backgroundColor: "transparent",
  },
  keyText: {
    fontSize: 26,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
});

export default CustomKeypad;

import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import CommonHeader from "../../../components/ui/commonHeader";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../components/common/txt";

const BRAND = "#111111";
const LIGHT_GREEN = "#F0F0F0";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#EEEEEE";
const AMBER = "#949494";

const BASE_SCORE = 66; // PIN + password
const BIOMETRIC_BONUS = 34; // biometrics brings it to 100

const SecurityRow = ({
  icon,
  label,
  sublabel,
  onPress,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right: React.ReactNode;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    onPress &&
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    onPress &&
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        <View style={styles.menuLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={BRAND} />
          </View>
          <View style={styles.menuTextBlock}>
            <Text style={styles.menuText}>{label}</Text>
            {sublabel ? (
              <Text style={styles.menuSubtext}>{sublabel}</Text>
            ) : null}
          </View>
        </View>
        {right}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Security = () => {
  const navigation = useNavigation<any>();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const score = BASE_SCORE + (biometricsEnabled ? BIOMETRIC_BONUS : 0);
  const scoreAnim = useRef(new Animated.Value(BASE_SCORE)).current;

  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: score,
      useNativeDriver: false,
      speed: 14,
      bounciness: 6,
    }).start();
  }, [score]);

  const barWidth = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const scoreLabel = score === 100 ? "Fully secured" : "Good, but improvable";
  const scoreColor = score === 100 ? BRAND : AMBER;

  return (
    <View style={styles.root}>
      <CommonHeader title="Security" back />

      <View style={styles.container}>
        {/* SHIELD HERO */}
        <View style={styles.heroCard}>
          <View style={styles.shieldCircle}>
            <Ionicons
              name={score === 100 ? "shield-checkmark" : "shield-half"}
              size={30}
              color={scoreColor}
            />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroScore}>{score}%</Text>
            <Text style={[styles.heroLabel, { color: scoreColor }]}>
              {scoreLabel}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: barWidth, backgroundColor: scoreColor },
            ]}
          />
        </View>
        {score < 100 && (
          <Text style={styles.hintText}>
            Turn on biometrics to reach 100% security
          </Text>
        )}

        {/* MENU */}
        <Text style={styles.sectionTitle}>Protection</Text>
        <View style={styles.menuContainer}>
          <SecurityRow
            icon="finger-print-outline"
            label="Biometrics"
            sublabel={
              biometricsEnabled ? "Face ID / fingerprint on" : "Currently off"
            }
            right={
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: BORDER, true: BRAND }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={BORDER}
                style={
                  Platform.OS === "android" ? styles.androidSwitch : undefined
                }
              />
            }
          />

          <View style={styles.divider} />

          <SecurityRow
            icon="keypad-outline"
            label="Change PIN"
            sublabel="Used to authorize transactions"
            onPress={() =>
              navigation.navigate("StackNav", { screen: "ChangePIN1" })
            }
            right={
              <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
            }
          />

          <View style={styles.divider} />

          <SecurityRow
            icon="lock-closed-outline"
            label="Change Password"
            sublabel="Used to log in to your account"
            onPress={() =>
              navigation.navigate("StackNav", { screen: "ChangePassword" })
            }
            right={
              <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
            }
          />
        </View>
      </View>
    </View>
  );
};

export default Security;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Hero ──────────────────────────────────────
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextBlock: {
    flex: 1,
  },
  heroScore: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: INK,
    letterSpacing: -0.5,
  },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    marginTop: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: LIGHT_GREEN,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  hintText: {
    fontSize: 12.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
    marginTop: 8,
  },

  // ── Menu ──────────────────────────────────────
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: "Poppins-SemiBold",
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 32,
    marginBottom: 10,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F4F4F4",
    marginLeft: 16 + 38 + 12, // aligns under the text, not the icon
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextBlock: {
    flex: 1,
  },
  menuText: {
    fontSize: 14.5,
    fontFamily: "Poppins-Medium",
    color: INK,
  },
  menuSubtext: {
    fontSize: 11.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
    marginTop: 1,
  },

  // ── Native switch tweak ───────────────────────
  androidSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

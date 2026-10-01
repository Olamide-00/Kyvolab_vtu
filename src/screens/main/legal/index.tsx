import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import React, { useRef } from "react";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#111111";
const LIGHT_GREEN = "#F0F0F0";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#EEEEEE";

type LegalItem = {
  id: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string; // ⏳ wire to real routes once these documents exist
};

const legalItems: LegalItem[] = [
  {
    id: 1,
    title: "Terms and Conditions",
    subtitle: "The rules for using Depay",
    icon: "document-text-outline",
    screen: "TermsAndConditions",
  },
  {
    id: 2,
    title: "Privacy Policy",
    subtitle: "How we handle your data",
    icon: "shield-checkmark-outline",
    screen: "PrivacyPolicy",
  },
  {
    id: 3,
    title: "FAQs",
    subtitle: "Common questions answered",
    icon: "help-circle-outline",
    screen: "FAQs",
  },
  {
    id: 4,
    title: "AML & KYC Policy",
    subtitle: "Our compliance standards",
    icon: "lock-closed-outline",
    screen: "AmlKycPolicy",
  },
];

const LegalRow = ({
  item,
  isLast,
  onPress,
}: {
  item: LegalItem;
  isLast: boolean;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.menuItem, !isLast && styles.divider]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.7}
      >
        <View style={styles.menuLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={19} color={BRAND} />
          </View>
          <View style={styles.menuTextBlock}>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuSubtext}>{item.subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Legal = () => {
  const handlePress = (item: LegalItem) => {
    if (item.screen) {
      // navigation.navigate("StackNav", { screen: item.screen });
    }
    // ⏳ TODO: these routes/documents don't exist yet — wire once
    // legal content and screens are ready.
    console.log(`Navigate to ${item.title}`);
  };

  return (
    <View style={styles.root}>
      <CommonHeader title="Legal" back />
      <View style={styles.container}>
        <View style={styles.menuContainer}>
          {legalItems.map((item, index) => (
            <LegalRow
              key={item.id}
              item={item}
              isLast={index === legalItems.length - 1}
              onPress={() => handlePress(item)}
            />
          ))}
        </View>

        <Text style={styles.footerText}>
          Depay v1.0.0 · Documents last updated July 2026
        </Text>
      </View>
    </View>
  );
};

export default Legal;

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
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
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
  footerText: {
    fontSize: 11.5,
    fontFamily: "Poppins-Regular",
    color: "#ADADAD",
    textAlign: "center",
    marginTop: 20,
  },
});

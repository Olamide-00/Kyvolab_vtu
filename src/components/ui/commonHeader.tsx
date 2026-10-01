import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../common/txt";
import { ArrowLeft } from "iconsax-react-native";
import { useNavigation } from "@react-navigation/native";
import { FONTS, RADIUS, THEME } from "../../theme";

interface HeaderProps {
  title: string;
  back?: boolean;
  onBackPress?: () => void;
  right?: React.ReactNode;
  /** Optional line under the title */
  subtitle?: string;
}

const CommonHeader = ({
  title,
  back,
  onBackPress,
  right,
  subtitle,
}: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const topPadding =
    insets.top > 0 ? insets.top + 4 : Platform.OS === "android" ? 16 : 8;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {back ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={THEME.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.sideSlot}>{right ?? null}</View>
      </View>
    </View>
  );
};

export default CommonHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.bg,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sideSlot: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: THEME.text,
    textAlign: "center",
    fontSize: 17,
    fontFamily: FONTS.bold,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: THEME.textMuted,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
});

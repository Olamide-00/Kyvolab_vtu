// Header.tsx
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../common/txt";
import { useNavigation } from "@react-navigation/native";
import useAuthStore, { selectUserData } from "../../store/userStore";
import { RADIUS, THEME } from "../../theme";

// Designed to sit on the indigo home hero.

interface HeaderProps {
  notificationCount?: number;
}

const Header = ({ notificationCount = 0 }: HeaderProps) => {
  const navigation = useNavigation<any>();
  const [imageFailed, setImageFailed] = useState(false);

  const userData = useAuthStore(selectUserData);
  const name = userData?.name || "User";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();
  const profilePicture = (userData as any)?.profilePicture;

  const showImage = !!profilePicture && !imageFailed;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      {/* Left — avatar + greeting */}
      <TouchableOpacity
        style={styles.left}
        onPress={() => navigation.navigate("StackNav", { screen: "User" })}
        activeOpacity={0.8}
      >
        <View style={styles.avatarRing}>
          {showImage ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.avatarImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.avatar}>
              <Text variant="bold" size="md" color={THEME.onPrimary}>
                {initial}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.greetingText}>
          <Text size="sm" color={THEME.textMuted} variant="regular">
            {getGreeting()},
          </Text>
          <Text variant="bold" color={THEME.text} style={styles.name}>
            {firstName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right — soft icon buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("StackNav", { screen: "Support" })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="headset"
            size={19}
            color={THEME.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            navigation.navigate("StackNav", { screen: "Notification" })
          }
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={19}
            color={THEME.text}
          />
          {notificationCount > 0 && (
            <View style={styles.notifBadge}>
              <Text
                size="xs"
                color={THEME.onPrimary}
                variant="bold"
                style={styles.notifCount}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  // ── Left ──────────────────────────────────────
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  avatarRing: {},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  greetingText: {
    gap: 1,
  },
  name: {
    fontSize: 17,
    letterSpacing: -0.3,
    lineHeight: 21,
  },

  // ── Right ─────────────────────────────────────
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Notification badge
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: THEME.surface,
  },
  notifCount: {
    fontSize: 9,
    lineHeight: 11,
  },
});

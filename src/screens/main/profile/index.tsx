import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../components/common/txt";
import ProfileMenuItem from "./component/item";
import useAuthStore from "../../../store/userStore";
import { useMerchantStats } from "../../../api/hooks/useMerchant";
import * as SecureStore from "expo-secure-store";
import { FONTS, RADIUS, THEME } from "../../../theme";

// "0123456789" → "012 345 6789"
const groupDigits = (value: string) =>
  /^\d{10}$/.test(value)
    ? `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
    : value;

const Profile = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userData = useAuthStore((state) => state.userData);
  const accountDetails = useAuthStore((state) => state.accountDetails);
  const logout = useAuthStore((state) => state.logout);

  const displayName = userData?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const profilePicture = userData?.profilePicture;
  const email = userData?.email || "";
  const handle = userData?.tag ? `@${userData.tag}` : email;

  const account = accountDetails?.[0];
  const accountNumber = account?.accountNumber || null;
  const bankName = account?.bankName;
  const accountName = account?.accountName;

  // Earnings + referrals — placeholder until the merchant endpoint lands
  const { data: stats } = useMerchantStats(email, "month");

  const showImage = !!profilePicture && !imageFailed;

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!accountNumber) return;
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          await SecureStore.deleteItemAsync("loginDate");
          await SecureStore.deleteItemAsync("isFreshLogin");
          logout();
        },
      },
    ]);
  };

  const go = (screen: string) => () =>
    navigation.navigate("StackNav", { screen });

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        {/* ── IDENTITY ── */}
        <View style={styles.identity}>
          <TouchableOpacity onPress={go("User")} activeOpacity={0.85}>
            {showImage ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.avatar}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              {handle}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editPill}
            onPress={go("EditUser")}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={12} color={THEME.text} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── MERCHANT CARD ── */}
        <View style={styles.card}>
          {accountNumber ? (
            <>
              <Text style={styles.cardLabel}>Account number</Text>
              <View style={styles.numberRow}>
                <Text style={styles.number} numberOfLines={1}>
                  {groupDigits(accountNumber)}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copied ? "checkmark" : "copy-outline"}
                    size={15}
                    color={THEME.text}
                  />
                  <Text style={styles.copyText}>
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
              {bankName || accountName ? (
                <Text style={styles.bankLine} numberOfLines={1}>
                  {[bankName, accountName].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </>
          ) : (
            <TouchableOpacity
              style={styles.setupRow}
              onPress={go("Wallet")}
              activeOpacity={0.8}
            >
              <View style={styles.setupIcon}>
                <Ionicons name="add" size={20} color={THEME.onPrimary} />
              </View>
              <View style={styles.setupText}>
                <Text style={styles.setupTitle}>Get your account number</Text>
                <Text style={styles.bankLine}>
                  Receive payments straight into your wallet
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>
          )}

          <View style={styles.cardDivider} />

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1}>
                ₦{(stats?.earnedInPeriod ?? 0).toLocaleString("en-NG")}
              </Text>
              <Text style={styles.statLabel}>Earned this month</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.stat}
              onPress={go("Refer")}
              activeOpacity={0.8}
            >
              <Text style={styles.statValue}>
                {(stats?.totalReferrals ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ACCOUNT ── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.group}>
          <ProfileMenuItem
            icon="person-outline"
            title="Personal details"
            onPress={go("User")}
          />
          <ProfileMenuItem
            icon="card-outline"
            title="Bank account"
            value={accountNumber ? "Linked" : "Set up"}
            onPress={go("Wallet")}
          />
          <ProfileMenuItem
            icon="people-outline"
            title="Referrals"
            value={String(stats?.totalReferrals ?? 0)}
            onPress={go("Refer")}
          />
          <ProfileMenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={go("Notification")}
            isLast
          />
        </View>

        {/* ── SECURITY ── */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.group}>
          <ProfileMenuItem
            icon="lock-closed-outline"
            title="PIN, password & biometrics"
            onPress={go("Security")}
            isLast
          />
        </View>

        {/* ── SUPPORT ── */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.group}>
          <ProfileMenuItem
            icon="help-buoy-outline"
            title="Help & support"
            onPress={go("Support")}
          />
          <ProfileMenuItem
            icon="document-text-outline"
            title="Terms & privacy"
            onPress={go("Legal")}
          />
          <ProfileMenuItem
            icon="star-outline"
            title="Rate the app"
            onPress={() => console.log("Rate App")}
            showChevron={false}
            isLast
          />
        </View>

        {/* ── LOG OUT ── */}
        <View style={[styles.group, styles.logoutGroup]}>
          <ProfileMenuItem
            icon="log-out-outline"
            title="Log out"
            onPress={handleLogout}
            showChevron={false}
            danger
            isLast
          />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default Profile;

const AVATAR = 64;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    // clear the floating tab bar
    paddingBottom: 130,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.8,
  },

  // ── Identity ──────────────────────────────────
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avatarFallback: {
    backgroundColor: THEME.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.3,
  },
  handle: {
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  editText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },

  // ── Merchant card ─────────────────────────────
  card: {
    marginTop: 20,
    padding: 18,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.accent,
  },
  cardLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  number: {
    flex: 1,
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: 1.5,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
  },
  copyText: {
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  bankLine: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },
  setupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  setupText: {
    flex: 1,
  },
  setupTitle: {
    fontSize: 15.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: THEME.primaryMuted,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: 16,
    backgroundColor: THEME.primaryMuted,
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  // ── Groups ────────────────────────────────────
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  logoutGroup: {
    marginTop: 24,
  },
  version: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
});

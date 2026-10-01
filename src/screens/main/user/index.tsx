import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import useAuthStore from "../../../store/userStore";
import { FONTS, RADIUS, THEME } from "../../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

const AVATAR = 92;

const User = () => {
  const navigation = useNavigation<any>();
  const userData = useAuthStore((state: any) => state.userData);

  const displayName = userData?.fullName || userData?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const isVerified = !!userData?.isWalletCreated;

  const handleEdit = () => navigation.navigate("EditUser");

  const details: { icon: IconName; label: string; value?: string }[] = [
    { icon: "person-outline", label: "Full name", value: displayName },
    { icon: "at-outline", label: "Username", value: userData?.tag },
    { icon: "mail-outline", label: "Email address", value: userData?.email },
    {
      icon: "call-outline",
      label: "Phone number",
      value: userData?.phoneNumber,
    },
    {
      icon: "calendar-outline",
      label: "Date of birth",
      value: userData?.dateOfBirth
        ? new Date(userData.dateOfBirth).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : undefined,
    },
    {
      icon: "male-female-outline",
      label: "Gender",
      value: userData?.gender
        ? userData.gender.charAt(0).toUpperCase() +
          userData.gender.slice(1).replace(/_/g, " ")
        : undefined,
    },
  ];

  const missing = details.filter((d) => !d.value).length;

  return (
    <View style={styles.root}>
      <CommonHeader
        title="My details"
        back
        right={
          <TouchableOpacity
            onPress={handleEdit}
            hitSlop={8}
            style={styles.headerEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={THEME.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Identity ── */}
        <View style={styles.identity}>
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {userData?.tag ? `@${userData.tag}` : userData?.email || ""}
          </Text>
        </View>

        {/* ── Status ── */}
        <TouchableOpacity
          style={styles.statusCard}
          activeOpacity={isVerified ? 1 : 0.8}
          disabled={isVerified}
          onPress={() => navigation.navigate("Wallet")}
        >
          <View style={[styles.statusIcon, isVerified && styles.statusIconOn]}>
            <Ionicons
              name={isVerified ? "shield-checkmark" : "shield-outline"}
              size={18}
              color={isVerified ? THEME.onPrimary : THEME.text}
            />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {isVerified ? "Verified account" : "Not verified yet"}
            </Text>
            <Text style={styles.statusBody}>
              {isVerified
                ? "Full access to payments and transfers."
                : "Create your account number to verify."}
            </Text>
          </View>
          {!isVerified && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.textSecondary}
            />
          )}
        </TouchableOpacity>

        {/* ── Details ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Personal information</Text>
          {missing > 0 ? (
            <Text style={styles.sectionHint}>{missing} missing</Text>
          ) : null}
        </View>
        <View style={styles.group}>
          {details.map((d, i) => (
            <View key={d.label} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name={d.icon} size={17} color={THEME.text} />
              </View>
              <View
                style={[
                  styles.rowBody,
                  i < details.length - 1 && styles.rowDivider,
                ]}
              >
                <Text style={styles.rowLabel}>{d.label}</Text>
                {d.value ? (
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {d.value}
                  </Text>
                ) : (
                  <Text style={styles.rowAdd} onPress={handleEdit}>
                    Add
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.85}
        >
          <Text style={styles.editButtonText}>Edit details</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerEdit: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Identity ──────────────────────────────────
  identity: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    marginBottom: 12,
  },
  avatarFallback: {
    backgroundColor: THEME.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  name: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.4,
  },
  email: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },

  // ── Status ────────────────────────────────────
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.accent,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconOn: {
    backgroundColor: THEME.primaryDeep,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  statusBody: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  // ── Details ───────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  group: {
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
    gap: 2,
    paddingVertical: 13,
    paddingRight: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  rowLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
  rowAdd: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: THEME.text,
    textDecorationLine: "underline",
  },

  editButton: {
    height: 54,
    marginTop: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },
});

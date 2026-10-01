import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Text from "../common/txt";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RADIUS, THEME } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { getCategoryIcon } from "../../utils/transactionHistory";

const formatDate = (dateString?: string) => {
  if (!dateString) return "---";
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return "---";
  return parsed.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Item = ({ data }: any) => {
  const navigation = useNavigation<any>();

  const category = typeof data.category === "string" ? data.category : "wallet";
  const label =
    typeof data.label === "string" && data.label.length > 0
      ? data.label
      : category.charAt(0).toUpperCase() + category.slice(1);

  const isDebit = data.type !== "credit";
  const amount = parseFloat(data.amount) || 0;
  const displayAmount = `${isDebit ? "-" : "+"}₦${amount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
  const amountColor = isDebit ? THEME.text : THEME.success;

  const status = typeof data.status === "string" ? data.status : "pending";
  const isSuccess = status === "success";
  // `date` (Mongo createdAt) first — it's always valid ISO. Provider
  // `transaction_date` strings are not ISO-8601 and were producing
  // "Invalid Date" here since they were being read first.
  const dateStr = data.date || data.transaction_date || data.time || "";
  const displayDate = formatDate(dateStr);

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("StackNav", {
          screen: "Receipt",
          params: { transaction: data },
        })
      }
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          isDebit ? styles.iconDebit : styles.iconCredit,
        ]}
      >
        <MaterialCommunityIcons
          name={getCategoryIcon(category) as any}
          size={20}
          color={isDebit ? THEME.primary : THEME.onPrimary}
        />
      </View>

      {/* Middle — label + date */}
      <View style={styles.middle}>
        <Text variant="semibold" size="md" color={THEME.text}>
          {label}
        </Text>
        <Text variant="regular" size="sm" color={THEME.textMuted}>
          {displayDate}
        </Text>
      </View>

      {/* Right — amount + status */}
      <View style={styles.right}>
        <Text variant="bold" size="md" color={amountColor}>
          {displayAmount}
        </Text>
        <View
          style={[
            styles.statusBadge,
            isSuccess ? styles.badgeSuccess : styles.badgeFailed,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isSuccess ? styles.dotSuccess : styles.dotFailed,
            ]}
          />
          <Text
            variant="semibold"
            size="xs"
            color={isSuccess ? THEME.success : THEME.error}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default Item;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: THEME.surface,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  // ── Icon ──────────────────────────────────────
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconDebit: {
    backgroundColor: THEME.primarySoft,
  },
  iconCredit: {
    backgroundColor: THEME.primary,
  },

  // ── Middle ────────────────────────────────────
  middle: {
    flex: 1,
    gap: 3,
  },

  // ── Right ─────────────────────────────────────
  right: {
    alignItems: "flex-end",
    gap: 5,
    flexShrink: 0,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeSuccess: {
    backgroundColor: THEME.successSoft,
  },
  badgeFailed: {
    backgroundColor: THEME.errorSoft,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotSuccess: {
    backgroundColor: THEME.success,
  },
  dotFailed: {
    backgroundColor: THEME.error,
  },
});

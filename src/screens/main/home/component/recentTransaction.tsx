// RecentTransaction.tsx
import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import Item from "../../../../components/ui/item";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../../../store/userStore";
import {
  useGetBillsHistory,
  useGetFundingHistory,
} from "../../../../api/hooks/useBills";
import Text from "../../../../components/common/txt";
import { mergeHistories } from "../../../../utils/transactionHistory";
import { RADIUS, SHADOW, THEME } from "../../../../theme";

const RecentTransaction = () => {
  const navigation = useNavigation<any>();

  const userData = useAuthStore((state) => state.userData);
  const email = userData?.email || "";

  const { data: bills = [], isLoading: billsLoading } =
    useGetBillsHistory(email);
  const { data: funding = [], isLoading: fundingLoading } =
    useGetFundingHistory(email);

  const isLoading = billsLoading || fundingLoading;
  const history = mergeHistories(bills, funding);
  const recentTransactions = history.slice(0, 5);

  const sanitize = (item: any) => ({
    ...item,
    label: typeof item.label === "string" ? item.label : "Transaction",
    status:
      typeof item.status === "string" ? item.status.toLowerCase() : "pending",
    category:
      typeof item.category === "string"
        ? item.category.toLowerCase()
        : "wallet",
    type: typeof item.type === "string" ? item.type.toLowerCase() : "debit",
  });

  // Shimmer sweep
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 220],
  });

  const SkeletonBlock = ({ style }: { style: any }) => (
    <View style={[style, styles.skeletonBase]}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      />
    </View>
  );

  const SkeletonRow = () => (
    <View style={styles.skeletonRow}>
      <SkeletonBlock style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <SkeletonBlock style={styles.skeletonLine} />
        <SkeletonBlock style={styles.skeletonLineShort} />
      </View>
      <SkeletonBlock style={styles.skeletonAmount} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text variant="bold" size="md" color={THEME.text}>
          Recent activity
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Transaction")}
          style={styles.viewAll}
          activeOpacity={0.7}
        >
          <Text variant="semibold" size="sm" color={THEME.primary}>
            See all
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={14}
            color={THEME.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : recentTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={28}
              color={THEME.primary}
            />
          </View>
          <Text variant="semibold" size="md" color={THEME.text}>
            No transactions yet
          </Text>
          <Text variant="regular" size="sm" color={THEME.textMuted} center>
            Your recent transactions will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {recentTransactions.map((item: any, index: number) => (
            <Item
              key={item._id || item.id || index.toString()}
              data={sanitize(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentTransaction;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primarySoft,
  },

  listContainer: {
    gap: 8,
  },

  // ── Empty ─────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 4,
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.xl,
    ...SHADOW.card,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  // ── Skeleton ──────────────────────────────────
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.lg,
  },
  skeletonBase: {
    backgroundColor: THEME.primaryTint,
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    width: "55%",
    height: 13,
    borderRadius: 4,
  },
  skeletonLineShort: {
    width: "35%",
    height: 11,
    borderRadius: 4,
  },
  skeletonAmount: {
    width: 60,
    height: 13,
    borderRadius: 4,
  },
});

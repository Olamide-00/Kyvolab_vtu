import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../components/common/txt";
import { COLORS } from "../../../constants/Colors";
import useAuthStore from "../../../store/userStore";
import { useGetBillsHistory } from "../../../api/hooks/useBills";
import CommonHeader from "../../../components/ui/commonHeader";

type NotificationItem = {
  _id?: string;
  id?: string;
  service?: string;
  label?: string;
  amount?: string | number;
  status?: string;
  date?: string;
  transaction_date?: string;
};

const formatAmount = (amount?: string | number) => {
  if (!amount) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

const getFullDate = (dateString?: string) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Group transactions by date label
const groupByDate = (items: NotificationItem[]) => {
  const groups: { [key: string]: NotificationItem[] } = {};
  items.forEach((item) => {
    const dateStr = item.transaction_date || item.date;
    if (!dateStr) {
      const key = "Earlier";
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return;
    }
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    let key = "Earlier";
    if (diff === 0) key = "Today";
    else if (diff === 1) key = "Yesterday";
    else if (diff < 7) key = "This Week";
    else if (diff < 30) key = "This Month";
    groups[key] = groups[key] || [];
    groups[key].push(item);
  });
  // Preserve order
  const order = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];
  return order
    .filter((k) => groups[k])
    .map((k) => ({ title: k, data: groups[k] }));
};

const SkeletonItem = () => {
  const opacity = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonItem, { opacity }]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
      <View style={styles.skeletonRight}>
        <View style={styles.skeletonAmount} />
        <View style={styles.skeletonBadge} />
      </View>
    </Animated.View>
  );
};

const Notification = () => {
  const navigation = useNavigation<any>();

  const userData = useAuthStore((state: any) => state.userData);
  const email = userData?.email || "";

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useGetBillsHistory(email);

  const grouped = groupByDate(notifications);

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => {
    const isFailed = item.status?.toLowerCase() === "failed";
    const isPending = item.status?.toLowerCase() === "pending";
    const isSuccess = !isFailed && !isPending;

    const statusColor = isFailed
      ? "#686868"
      : isPending
        ? "#A6A6A6"
        : "#9B9B9B";
    const iconName = isFailed
      ? "close-circle"
      : isPending
        ? "clock-outline"
        : "check-circle";
    const iconBg = isFailed ? "#F5F5F5" : isPending ? "#FBFBFB" : "#FAFAFA";
    const timeAgo = getTimeAgo(item.transaction_date || item.date);
    const fullDate = getFullDate(item.transaction_date || item.date);
    const label = item.service || item.label || "Transaction";

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("StackNav", {
            screen: "Receipt",
            params: { transaction: item },
          })
        }
      >
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={22}
            color={statusColor}
          />
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text variant="semibold" size="sm" color="#1A1A1A" numberOfLines={1}>
            {label}
          </Text>
          <Text size="xs" color="#A1A1A1">
            {fullDate}
          </Text>
        </View>

        {/* Right */}
        <View style={styles.right}>
          <Text variant="bold" size="sm" color={statusColor}>
            {formatAmount(item.amount)}
          </Text>
          <Text size="xs" color="#B1B1B1" style={styles.timeAgo}>
            {timeAgo}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = ({
    item,
  }: {
    item: { title: string; data: NotificationItem[] };
  }) => (
    <View style={styles.section}>
      {/* Date group label */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text
          size="xs"
          variant="semibold"
          color="#B1B1B1"
          style={styles.sectionLabel}
        >
          {item.title}
        </Text>
        <View style={styles.sectionLine} />
      </View>

      {item.data.map((n, i) => renderItem({ item: n, index: i }))}
    </View>
  );

  return (
    <View style={styles.root}>
      <CommonHeader title="Notifications" back />

      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} />
          ))}
        </View>
      ) : isError || notifications.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={52}
            color="rgba(69,69,69,0.15)"
          />
          <Text variant="semibold" size="md" color="#A2A2A2">
            No notifications yet
          </Text>
          <Text size="sm" color="#C5C5C5" center>
            Your transaction updates will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.title}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // ── List ──────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 4,
  },

  // ── Section group ─────────────────────────────
  section: {
    gap: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EBEBEB",
  },
  sectionLabel: {
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Item ──────────────────────────────────────
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  timeAgo: {
    letterSpacing: 0.1,
  },

  // ── Skeleton ──────────────────────────────────
  skeletonList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F4F4F4",
  },
  skeletonContent: { flex: 1, gap: 6 },
  skeletonLine: {
    width: "55%",
    height: 13,
    backgroundColor: "#F4F4F4",
    borderRadius: 4,
  },
  skeletonLineShort: {
    width: "38%",
    height: 11,
    backgroundColor: "#FAFAFA",
    borderRadius: 4,
  },
  skeletonRight: { alignItems: "flex-end", gap: 6 },
  skeletonAmount: {
    width: 64,
    height: 13,
    backgroundColor: "#F4F4F4",
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 40,
    height: 11,
    backgroundColor: "#FAFAFA",
    borderRadius: 4,
  },

  // ── Empty ─────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
  },
});

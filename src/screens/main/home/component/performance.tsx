import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../../components/common/txt";
import useAuthStore from "../../../../store/userStore";
import {
  useGetBillsHistory,
  useGetFundingHistory,
} from "../../../../api/hooks/useBills";
import {
  StatsPeriod,
  useMerchantStats,
} from "../../../../api/hooks/useMerchant";
import {
  mergeHistories,
  TransactionItem,
} from "../../../../utils/transactionHistory";
import { FONTS, RADIUS, THEME } from "../../../../theme";

const PERIODS: { value: StatsPeriod; label: string; caption: string }[] = [
  { value: "today", label: "Today", caption: "today" },
  { value: "week", label: "This week", caption: "in the last 7 days" },
  { value: "month", label: "This month", caption: "this month" },
];

// Start of the selected period, in local time
const periodStart = (period: StatsPeriod) => {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - 6);
    return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const naira = (n: number, decimals = 2) =>
  `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

interface PerformanceProps {
  refreshTick?: number;
}

const Performance = ({ refreshTick = 0 }: PerformanceProps) => {
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<StatsPeriod>("today");

  const email = useAuthStore((s) => s.userData?.email) || "";

  // Earnings + referrals — backend endpoint pending (see useMerchantStats)
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useMerchantStats(email, period);

  // Sales volume is derived from existing history (shared query cache
  // with Recent activity, so no extra network calls)
  const { data: bills = [], refetch: refetchBills } = useGetBillsHistory(email);
  const { data: funding = [] } = useGetFundingHistory(email);

  useEffect(() => {
    if (refreshTick > 0) {
      refetchStats();
      refetchBills();
    }
  }, [refreshTick]);

  const sales = useMemo(() => {
    const since = periodStart(period).getTime();
    let volume = 0;
    let count = 0;
    mergeHistories(bills, funding).forEach((t: TransactionItem) => {
      const when = t.date ? new Date(t.date).getTime() : 0;
      const type = String(t.type || "debit").toLowerCase();
      const status = String(t.status || "").toLowerCase();
      if (when < since || type === "credit" || status !== "success") return;
      volume += parseFloat(String(t.amount)) || 0;
      count += 1;
    });
    return { volume, count };
  }, [bills, funding, period]);

  const caption = PERIODS.find((p) => p.value === period)!.caption;

  return (
    <View>
      {/* Title + period switch */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Performance</Text>
      </View>
      <View style={styles.periods}>
        {PERIODS.map((p) => {
          const active = p.value === period;
          return (
            <TouchableOpacity
              key={p.value}
              style={[styles.period, active && styles.periodActive]}
              onPress={() => setPeriod(p.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.periodText, active && styles.periodTextActive]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Featured: amount earned */}
      <View style={styles.earnedCard}>
        <View style={styles.earnedTop}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={18} color={THEME.onPrimary} />
          </View>
          <Text style={styles.cardLabel}>Amount earned</Text>
        </View>
        {statsLoading ? (
          <ActivityIndicator color={THEME.primary} style={styles.loader} />
        ) : (
          <Text
            style={styles.earnedValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {naira(stats?.earnedInPeriod ?? 0)}
          </Text>
        )}
        <Text style={styles.cardCaption}>Commission earned {caption}</Text>
      </View>

      {/* Secondary stats */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("StackNav", { screen: "Refer" })}
        >
          <View style={styles.statTop}>
            <View style={styles.iconCircleLight}>
              <Ionicons name="people-outline" size={17} color={THEME.primary} />
            </View>
            <Ionicons name="arrow-forward" size={15} color={THEME.textMuted} />
          </View>
          <Text style={styles.statValue}>
            {statsLoading ? "—" : (stats?.totalReferrals ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.cardLabel}>Total referrals</Text>
          <Text style={styles.cardCaption} numberOfLines={1}>
            +{stats?.referralsInPeriod ?? 0} {caption}
          </Text>
        </TouchableOpacity>

        <View style={styles.statCard}>
          <View style={styles.statTop}>
            <View style={styles.iconCircleLight}>
              <Ionicons
                name="bag-handle-outline"
                size={17}
                color={THEME.primary}
              />
            </View>
          </View>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {naira(sales.volume, 0)}
          </Text>
          <Text style={styles.cardLabel}>Sales</Text>
          <Text style={styles.cardCaption} numberOfLines={1}>
            {sales.count} {sales.count === 1 ? "transaction" : "transactions"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Performance;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },

  // Period switch
  periods: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  period: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  periodActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.primaryMuted,
  },
  periodText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  periodTextActive: {
    color: THEME.text,
  },

  // Earned
  earnedCard: {
    padding: 18,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  earnedTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  earnedValue: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -1,
    marginTop: 14,
  },
  loader: {
    alignSelf: "flex-start",
    marginTop: 22,
    marginBottom: 8,
  },

  // Secondary
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statValue: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.5,
  },

  // Shared
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleLight: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  cardCaption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    marginTop: 4,
  },
});

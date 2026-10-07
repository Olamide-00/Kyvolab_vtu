import {
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import CommonHeader from "../../../components/ui/commonHeader";
import Text from "../../../components/common/txt";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { FONTS, RADIUS, THEME } from "../../../theme";
import {
  EarningType,
  useCommissionTerms,
  useEarningHistory,
  useReferralList,
  useReferralOverview,
  useReferralStats,
} from "../../../api/hooks/useReferral";

type Tab = "earnings" | "referrals";

const FILTERS: { value: EarningType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cashback", label: "Cashback" },
  { value: "referral", label: "Referrals" },
];

const naira = (value: number, decimals = 2) =>
  `₦${(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Refer = () => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("earnings");
  const [filter, setFilter] = useState<EarningType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const overview = useReferralOverview();
  const stats = useReferralStats();
  const terms = useCommissionTerms();
  const earnings = useEarningHistory(filter, 15, tab === "earnings");
  const referrals = useReferralList(15, tab === "referrals");

  const referralCode = overview.data?.referralCode ?? "";
  const referralPercent = terms.data?.referralPercent ?? 10;
  const cashbackPercent = terms.data?.cashbackPercent ?? 40;

  const earningRows =
    earnings.data?.pages.flatMap((page) => page.earnings) ?? [];
  const referralRows =
    referrals.data?.pages.flatMap((page) => page.referrals) ?? [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      overview.refetch(),
      stats.refetch(),
      tab === "earnings" ? earnings.refetch() : referrals.refetch(),
    ]);
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShareCode = async () => {
    if (!referralCode) return;
    try {
      await Share.share({
        message: `Join me on Depay! Use my code ${referralCode} when you sign up and earn ${cashbackPercent}% cashback on your purchases. 🎉`,
      });
    } catch {
      return;
    }
  };

  const loadingOverview = overview.isLoading;
  const overviewFailed = overview.isError && !overview.data;

  const renderEarnings = () => {
    if (earnings.isLoading) {
      return <ActivityIndicator color={THEME.primary} style={styles.loader} />;
    }
    if (earnings.isError) {
      return (
        <TouchableOpacity onPress={() => earnings.refetch()}>
          <Text style={styles.emptyText}>
            Couldn't load earnings. Tap to retry.
          </Text>
        </TouchableOpacity>
      );
    }
    if (earningRows.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No earnings yet. You earn a share of the commission on every
          successful purchase.
        </Text>
      );
    }

    return earningRows.map((item, index) => {
      const isReferral = item.type === "referral";
      return (
        <View
          key={item.id}
          style={[
            styles.row,
            index !== earningRows.length - 1 && styles.rowDivider,
          ]}
        >
          <View style={styles.rowAvatar}>
            <MaterialCommunityIcons
              name={isReferral ? "account-multiple" : "cash-refund"}
              size={16}
              color={THEME.primary}
            />
          </View>
          <View style={styles.rowDetails}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {isReferral
                ? `${item.referredName ?? "A referral"} · ${item.service}`
                : `Cashback · ${item.service}`}
            </Text>
            <Text style={styles.rowSub}>
              {formatDate(item.date)} · on {naira(item.transactionAmount, 0)}
            </Text>
          </View>
          <Text style={styles.rowAmount}>+{naira(item.amount)}</Text>
        </View>
      );
    });
  };

  const renderReferrals = () => {
    if (referrals.isLoading) {
      return <ActivityIndicator color={THEME.primary} style={styles.loader} />;
    }
    if (referrals.isError) {
      return (
        <TouchableOpacity onPress={() => referrals.refetch()}>
          <Text style={styles.emptyText}>
            Couldn't load referrals. Tap to retry.
          </Text>
        </TouchableOpacity>
      );
    }
    if (referralRows.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No referrals yet. Share your code to get started.
        </Text>
      );
    }

    return referralRows.map((item, index) => (
      <View
        key={item.id}
        style={[
          styles.row,
          index !== referralRows.length - 1 && styles.rowDivider,
        ]}
      >
        <View style={styles.rowAvatar}>
          <MaterialCommunityIcons
            name="account"
            size={16}
            color={THEME.primary}
          />
        </View>
        <View style={styles.rowDetails}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rowSub}>
            {item.transactions === 0
              ? `Joined ${formatDate(item.joinedAt)} · no purchases yet`
              : `${item.transactions} ${item.transactions === 1 ? "purchase" : "purchases"} · last ${formatDate(item.lastTransactionAt)}`}
          </Text>
        </View>
        <Text style={styles.rowAmount}>
          {item.earned > 0 ? `+${naira(item.earned)}` : naira(0)}
        </Text>
      </View>
    ));
  };

  const activeQuery = tab === "earnings" ? earnings : referrals;

  return (
    <View style={styles.root}>
      <CommonHeader title="Referrals" back />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>INVITE FRIENDS</Text>
          <Text style={styles.heroTitle}>
            Earn <Text style={styles.heroTitleAccent}>{referralPercent}%</Text>
            {"\n"}on every purchase
          </Text>
          <Text style={styles.heroSub}>
            You earn {referralPercent}% of the commission each time a friend you
            invite buys airtime, data or pays a bill.
          </Text>

          <TouchableOpacity
            style={styles.codeBlock}
            onPress={handleCopyCode}
            activeOpacity={0.85}
            disabled={!referralCode}
          >
            {loadingOverview ? (
              <ActivityIndicator color={THEME.primary} />
            ) : (
              <Text style={styles.codeText}>{referralCode || "—"}</Text>
            )}
            <View style={styles.codeAction}>
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={16}
                color={THEME.primary}
              />
              <Text style={styles.codeActionText}>
                {copied ? "Copied!" : "Tap to copy"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, !referralCode && styles.shareDisabled]}
            onPress={handleShareCode}
            activeOpacity={0.85}
            disabled={!referralCode}
          >
            <Ionicons name="share-social" size={17} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share invite</Text>
          </TouchableOpacity>

          {overviewFailed && (
            <TouchableOpacity onPress={() => overview.refetch()}>
              <Text style={styles.errorText}>
                Couldn't load your code. Tap to retry.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total earned</Text>
          <Text
            style={styles.totalValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {naira(overview.data?.totalEarned ?? 0)}
          </Text>
          <Text style={styles.totalCaption}>
            {naira(overview.data?.thisMonth ?? 0)} this month · paid into your
            wallet
          </Text>
        </View>

        <View style={styles.tileRow}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>
              {naira(overview.data?.referral?.total ?? 0)}
            </Text>
            <Text style={styles.tileLabel}>From referrals</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>
              {naira(overview.data?.cashback?.total ?? 0)}
            </Text>
            <Text style={styles.tileLabel}>Your cashback</Text>
          </View>
        </View>

        <View style={styles.tileRow}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>
              {(stats.data?.totalReferrals ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.tileLabel}>
              Referrals · {stats.data?.activeReferrals ?? 0} active
            </Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>
              {(stats.data?.newReferrals?.thisMonth ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.tileLabel}>Joined this month</Text>
          </View>
        </View>

        {(overview.data?.pending ?? 0) > 0 && (
          <Text style={styles.pendingNote}>
            {naira(overview.data?.pending ?? 0)} is being processed and will be
            added to your wallet shortly.
          </Text>
        )}

        <View style={styles.tabs}>
          {(["earnings", "referrals"] as Tab[]).map((value) => {
            const active = tab === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {value === "earnings"
                    ? "Earnings"
                    : `Referrals (${stats.data?.totalReferrals ?? 0})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === "earnings" && (
          <View style={styles.filters}>
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.filter, active && styles.filterActive]}
                  onPress={() => setFilter(item.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.list}>
          {tab === "earnings" ? renderEarnings() : renderReferrals()}
        </View>

        {activeQuery.hasNextPage && (
          <TouchableOpacity
            style={styles.loadMore}
            onPress={() => activeQuery.fetchNextPage()}
            disabled={activeQuery.isFetchingNextPage}
            activeOpacity={0.8}
          >
            {activeQuery.isFetchingNextPage ? (
              <ActivityIndicator color={THEME.primary} />
            ) : (
              <Text style={styles.loadMoreText}>Load more</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.footnote}>
          You also earn {cashbackPercent}% of the commission on your own
          purchases. Earnings are credited to your wallet after each successful
          purchase. If a provider reverses a transaction, the commission on it
          is reversed too.
        </Text>
      </ScrollView>
    </View>
  );
};

export default Refer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: THEME.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: FONTS.bold,
    color: THEME.text,
    textAlign: "center",
    lineHeight: 37,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroTitleAccent: {
    color: THEME.primary,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  codeBlock: {
    width: "100%",
    minHeight: 84,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  codeText: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: 2,
    marginBottom: 6,
  },
  codeAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  codeActionText: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: THEME.primary,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
  },
  shareDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: THEME.onPrimary,
  },
  errorText: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    marginTop: 12,
  },
  totalCard: {
    marginTop: 28,
    backgroundColor: THEME.primaryDarkest,
    borderRadius: RADIUS.hero,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  totalLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: THEME.onPrimaryMuted,
  },
  totalValue: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
    marginTop: 4,
  },
  totalCaption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.onPrimaryMuted,
    marginTop: 6,
  },
  tileRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: THEME.bg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  tileValue: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  tileLabel: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    marginTop: 3,
  },
  pendingNote: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    marginTop: 12,
    lineHeight: 17,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: THEME.primarySoft,
    borderRadius: RADIUS.pill,
    padding: 4,
    marginTop: 28,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  tabActive: {
    backgroundColor: THEME.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  tabTextActive: {
    color: THEME.onPrimary,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  filter: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  filterActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  filterText: {
    fontSize: 12.5,
    fontFamily: FONTS.medium,
    color: THEME.textSecondary,
  },
  filterTextActive: {
    color: THEME.text,
    fontFamily: FONTS.semibold,
  },
  list: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.primarySoft,
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDetails: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13.5,
    fontFamily: FONTS.medium,
    color: THEME.text,
  },
  rowSub: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    marginTop: 1,
  },
  rowAmount: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.primary,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    textAlign: "center",
    paddingVertical: 24,
    lineHeight: 19,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.primary,
  },
  footnote: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    lineHeight: 17,
    marginTop: 20,
    textAlign: "center",
  },
});

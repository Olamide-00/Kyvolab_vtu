import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../../store/userStore";
import {
  useGetBillsHistory,
  useGetFundingHistory,
} from "../../../api/hooks/useBills";
import Text from "../../../components/common/txt";
import {
  mergeHistories,
  getCategoryIcon,
  type TransactionItem,
} from "../../../utils/transactionHistory";
import { FONTS, RADIUS, THEME } from "../../../theme";

type Direction = "all" | "in" | "out";

const lower = (v: unknown, fallback: string) =>
  typeof v === "string" ? v.toLowerCase() : fallback;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const naira = (n: number) =>
  `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// `date` (Mongo createdAt, always valid ISO) must come first —
// `transaction_date` is a raw provider string that can fail to parse.
const dateOf = (item: TransactionItem) => {
  const raw = item.date || item.transaction_date;
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d.getTime()) ? d : null;
};

const dayKey = (d: Date | null) =>
  d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : "unknown";

const dayTitle = (d: Date | null) => {
  if (!d) return "Earlier";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

type Row = {
  key: string;
  raw: TransactionItem;
  label: string;
  category: string;
  isCredit: boolean;
  status: string;
  amount: number;
  date: Date | null;
  recipient?: string;
};

const Transaction = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [direction, setDirection] = useState<Direction>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const email = useAuthStore((state: any) => state.userData?.email) || "";

  const {
    data: bills = [],
    isLoading: billsLoading,
    refetch: refetchBills,
    isRefetching: billsRefetching,
  } = useGetBillsHistory(email);
  const {
    data: funding = [],
    isLoading: fundingLoading,
    refetch: refetchFunding,
    isRefetching: fundingRefetching,
  } = useGetFundingHistory(email);

  const isLoading = billsLoading || fundingLoading;

  // Normalise once — every filter below works on these rows
  const rows: Row[] = useMemo(
    () =>
      mergeHistories(bills, funding).map((item, i) => {
        const cat = lower(item.category, "wallet");
        const label =
          typeof item.label === "string" && item.label.length > 0
            ? item.label
            : capitalize(cat);
        return {
          key: item._id || String(i),
          raw: item,
          label,
          category: cat,
          isCredit: lower(item.type, "debit") === "credit",
          status: lower(item.status, "pending"),
          amount: parseFloat(String(item.amount)) || 0,
          date: dateOf(item),
          recipient: item.phone || item.phoneNumber || item.billersCode,
        };
      }),
    [bills, funding],
  );

  // Categories actually present, for the chip row
  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (direction === "in" && !r.isCredit) return false;
      if (direction === "out" && r.isCredit) return false;
      if (category && r.category !== category) return false;
      if (!q) return true;
      return (
        r.label.toLowerCase().includes(q) ||
        r.category.includes(q) ||
        String(r.recipient || "").includes(q) ||
        String(r.amount).includes(q)
      );
    });
  }, [rows, direction, category, query]);

  // Totals of successful transactions in the current view
  const totals = useMemo(() => {
    let moneyIn = 0;
    let moneyOut = 0;
    filtered.forEach((r) => {
      if (r.status !== "success") return;
      if (r.isCredit) moneyIn += r.amount;
      else moneyOut += r.amount;
    });
    return { moneyIn, moneyOut };
  }, [filtered]);

  const sections = useMemo(() => {
    const map = new Map<string, { title: string; data: Row[] }>();
    filtered.forEach((r) => {
      const k = dayKey(r.date);
      if (!map.has(k)) map.set(k, { title: dayTitle(r.date), data: [] });
      map.get(k)!.data.push(r);
    });
    return Array.from(map.values());
  }, [filtered]);

  const hasFilter = direction !== "all" || !!category || !!query.trim();

  const clearFilters = () => {
    setDirection("all");
    setCategory(null);
    setQuery("");
  };

  const openReceipt = (item: TransactionItem) =>
    navigation.navigate("StackNav", {
      screen: "Receipt",
      params: { transaction: item },
    });

  // ── Pieces ───────────────────────────────────────────────────

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const header = (
    <View>
      {/* Title */}
      <Text style={styles.title}>Transactions</Text>

      {/* Search */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={THEME.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, number or amount"
          placeholderTextColor={THEME.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={THEME.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryCol}>
          <View style={styles.summaryHead}>
            <View style={styles.summaryIcon}>
              <Ionicons name="arrow-down" size={13} color={THEME.text} />
            </View>
            <Text style={styles.summaryLabel}>Money in</Text>
          </View>
          <Text
            style={styles.summaryValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {naira(totals.moneyIn)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <View style={styles.summaryHead}>
            <View style={styles.summaryIcon}>
              <Ionicons name="arrow-up" size={13} color={THEME.text} />
            </View>
            <Text style={styles.summaryLabel}>Money out</Text>
          </View>
          <Text
            style={styles.summaryValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {naira(totals.moneyOut)}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}
      >
        <Chip
          label="All"
          active={direction === "all" && !category}
          onPress={() => {
            setDirection("all");
            setCategory(null);
          }}
        />
        <Chip
          label="Money in"
          active={direction === "in"}
          onPress={() => setDirection(direction === "in" ? "all" : "in")}
        />
        <Chip
          label="Money out"
          active={direction === "out"}
          onPress={() => setDirection(direction === "out" ? "all" : "out")}
        />
        {categories.length > 1 && <View style={styles.chipDivider} />}
        {categories.length > 1 &&
          categories.map((c) => (
            <Chip
              key={c}
              label={capitalize(c)}
              active={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
      </ScrollView>

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {isLoading
            ? "Loading…"
            : `${filtered.length} ${filtered.length === 1 ? "transaction" : "transactions"}`}
        </Text>
        {hasFilter ? (
          <TouchableOpacity onPress={clearFilters} hitSlop={8}>
            <Text style={styles.clearText}>Clear filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderRow = ({
    item,
    index,
    section,
  }: {
    item: Row;
    index: number;
    section: { data: Row[] };
  }) => {
    const first = index === 0;
    const last = index === section.data.length - 1;
    const failed = item.status === "failed";
    const pending = !failed && item.status !== "success";

    return (
      <TouchableOpacity
        style={[styles.row, first && styles.rowFirst, last && styles.rowLast]}
        onPress={() => openReceipt(item.raw)}
        activeOpacity={0.7}
      >
        <View style={[styles.rowIcon, item.isCredit && styles.rowIconIn]}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category) as any}
            size={19}
            color={item.isCredit ? THEME.onPrimary : THEME.text}
          />
        </View>

        <View style={[styles.rowBody, !last && styles.rowDivider]}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.rowMeta} numberOfLines={1}>
              {item.date
                ? item.date.toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
              {item.recipient ? ` · ${item.recipient}` : ""}
            </Text>
          </View>

          <View style={styles.rowRight}>
            <Text
              style={[styles.rowAmount, failed && styles.rowAmountFailed]}
              numberOfLines={1}
            >
              {item.isCredit ? "+" : "−"}
              {naira(item.amount)}
            </Text>
            {failed || pending ? (
              <View style={[styles.status, failed && styles.statusFailed]}>
                <Text
                  style={[styles.statusText, failed && styles.statusTextFailed]}
                >
                  {failed ? "Failed" : capitalize(item.status)}
                </Text>
              </View>
            ) : (
              <Text style={styles.rowCategory}>
                {capitalize(item.category)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const empty = isLoading ? (
    <View style={styles.skeletonCard}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonLines}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          </View>
          <View style={styles.skeletonAmount} />
        </View>
      ))}
    </View>
  ) : (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={26}
          color={THEME.text}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {hasFilter ? "Nothing matches" : "No transactions yet"}
      </Text>
      <Text style={styles.emptyText}>
        {hasFilter
          ? "Try a different search or filter."
          : "Payments and top-ups will show up here."}
      </Text>
      {hasFilter ? (
        <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
          <Text style={styles.emptyButtonText}>Clear filters</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderRow}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={billsRefetching || fundingRefetching}
            onRefresh={() => {
              refetchBills();
              refetchFunding();
            }}
            tintColor={THEME.primary}
            colors={[THEME.primary]}
          />
        }
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  content: {
    paddingHorizontal: 16,
    // clear the floating tab bar
    paddingBottom: 130,
  },

  // ── Header ────────────────────────────────────
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.8,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: THEME.text,
  },

  // ── Summary ───────────────────────────────────
  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.accent,
  },
  summaryCol: {
    flex: 1,
    gap: 6,
  },
  summaryHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.4,
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: 16,
    backgroundColor: THEME.primaryMuted,
  },

  // ── Chips ─────────────────────────────────────
  chipScroll: {
    marginTop: 14,
    marginHorizontal: -16,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  chipTextActive: {
    color: THEME.onPrimary,
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.border,
    marginHorizontal: 2,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  countText: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  clearText: {
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
    textDecorationLine: "underline",
  },

  // ── Sections ──────────────────────────────────
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Rows share one white card per day: first/last rows round the corners
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 14,
    backgroundColor: THEME.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: THEME.border,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconIn: {
    backgroundColor: THEME.primaryDeep,
  },
  rowBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingRight: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 14.5,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
  rowMeta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
    maxWidth: "45%",
  },
  rowAmount: {
    fontSize: 14.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  rowAmountFailed: {
    color: THEME.textMuted,
    textDecorationLine: "line-through",
  },
  rowCategory: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  status: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.primaryMuted,
  },
  statusFailed: {
    backgroundColor: THEME.primaryDeep,
    borderColor: THEME.primaryDeep,
  },
  statusText: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: THEME.textSecondary,
  },
  statusTextFailed: {
    color: THEME.onPrimary,
  },

  // ── Loading ───────────────────────────────────
  skeletonCard: {
    marginTop: 20,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 14,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primarySoft,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    width: "60%",
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.primarySoft,
  },
  skeletonLineShort: {
    width: "35%",
  },
  skeletonAmount: {
    width: 64,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.primarySoft,
  },

  // ── Empty ─────────────────────────────────────
  empty: {
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 44,
    paddingHorizontal: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.primaryMuted,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
  },
  emptyButtonText: {
    fontSize: 13.5,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },
});

export default Transaction;

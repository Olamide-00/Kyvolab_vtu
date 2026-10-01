import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { services as serviceData } from "../../../constants/service";
import Text from "../../../components/common/txt";
import { FONTS, RADIUS, THEME } from "../../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Category shortcuts at the top of the page
const CATEGORIES: {
  key: string;
  title: string;
  caption: string;
  icon: IconName;
  screen: string;
  params?: Record<string, string>;
  wide?: boolean;
}[] = [
  {
    key: "airtime",
    title: "Airtime",
    caption: "Top up any line",
    icon: "call-outline",
    screen: "Airtime",
    params: { serviceType: "airtime" },
  },
  {
    key: "data",
    title: "Data",
    caption: "Bundles for all networks",
    icon: "wifi-outline",
    screen: "Airtime",
    params: { serviceType: "data" },
  },
  {
    key: "electricity",
    title: "Electricity",
    caption: "Prepaid & postpaid",
    icon: "flash-outline",
    screen: "Electricity",
  },
  {
    key: "tv",
    title: "Cable TV",
    caption: "DStv, GOtv & more",
    icon: "tv-outline",
    screen: "TV",
  },
  {
    key: "education",
    title: "Education",
    caption: "JAMB & WAEC PINs",
    icon: "school-outline",
    screen: "Education",
    wide: true,
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  airtime: "Airtime",
  data: "Data",
  electricity: "Electricity",
  tv: "Cable TV",
  education: "Education",
};

// Provider directory order
const GROUP_ORDER = ["airtime", "data", "electricity", "tv", "education"];

const Service = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((cat) => ({
        key: cat,
        title: CATEGORY_LABEL[cat],
        items: serviceData
          .filter((s) => s.category === cat)
          .filter((s) => !q || s.label.toLowerCase().includes(q)),
      })).filter((g) => g.items.length > 0),
    [q],
  );

  const resultCount = groups.reduce((n, g) => n + g.items.length, 0);

  const openProvider = (item: any) => {
    navigation.navigate("StackNav", {
      screen: item.screen,
      params: {
        serviceType: item.serviceType,
        network: item.network,
        biller: item.biller,
      },
    });
  };

  const openCategory = (c: (typeof CATEGORIES)[number]) => {
    navigation.navigate("StackNav", { screen: c.screen, params: c.params });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
      >
        {/* ── Title ── */}
        <Text style={styles.title}>Pay bills</Text>
        <Text style={styles.subtitle}>
          Airtime, data, power, TV and exams — all in one place.
        </Text>

        {/* ── Search ── */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={THEME.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search MTN, DStv, Ikeja…"
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

        {/* ── Categories (hidden while searching) ── */}
        {!q ? (
          <View style={styles.grid}>
            {CATEGORIES.map((c, i) => {
              const dark = i === 0;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.tile,
                    c.wide && styles.tileWide,
                    dark && styles.tileDark,
                  ]}
                  onPress={() => openCategory(c)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.tileIcon, dark && styles.tileIconDark]}>
                    <Ionicons
                      name={c.icon}
                      size={20}
                      color={dark ? THEME.primary : THEME.onPrimary}
                    />
                  </View>
                  <View style={c.wide ? styles.tileTextWide : undefined}>
                    <Text
                      style={[
                        styles.tileTitle,
                        c.wide && styles.tileTitleWide,
                        dark && styles.onDark,
                      ]}
                    >
                      {c.title}
                    </Text>
                    <Text
                      style={[styles.tileCaption, dark && styles.onDarkMuted]}
                      numberOfLines={1}
                    >
                      {c.caption}
                    </Text>
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={dark ? THEME.onPrimary : THEME.textMuted}
                    style={c.wide ? undefined : styles.tileArrow}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.resultCount}>
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </Text>
        )}

        {/* ── Provider directory ── */}
        {!q && <Text style={styles.directoryTitle}>All providers</Text>}

        {groups.length > 0 ? (
          groups.map((g) => (
            <View key={g.key} style={styles.group}>
              <Text style={styles.groupTitle}>{g.title}</Text>
              <View style={styles.groupCard}>
                {g.items.map((item: any, idx: number) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.row}
                    onPress={() => openProvider(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.logo}>
                      {item.image ? (
                        <Image
                          source={item.image}
                          style={styles.logoImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.logoText}>
                          {item.short || item.label.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.rowBody,
                        idx < g.items.length - 1 && styles.rowDivider,
                      ]}
                    >
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={THEME.primaryMuted}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={28} color={THEME.textMuted} />
            <Text style={styles.emptyTitle}>No match for "{query}"</Text>
            <Text style={styles.emptyText}>
              Try a network, DisCo or TV provider name.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Service;

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

  // ── Title + search ────────────────────────────
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    marginTop: 4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    marginTop: 20,
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

  // ── Category tiles ────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  tile: {
    // two per row with a 10px gap
    width: "48.5%",
    minHeight: 128,
    padding: 14,
    justifyContent: "space-between",
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  tileWide: {
    width: "100%",
    minHeight: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tileDark: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tileIconDark: {
    backgroundColor: THEME.surface,
  },
  tileTextWide: { flex: 1 },
  tileTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
    marginTop: 12,
  },
  tileTitleWide: { marginTop: 0 },
  tileCaption: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    marginTop: 1,
  },
  tileArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  onDark: { color: THEME.onPrimary },
  onDarkMuted: { color: THEME.onPrimaryMuted },

  // ── Directory ─────────────────────────────────
  directoryTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.3,
    marginTop: 30,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    marginTop: 16,
  },
  group: {
    marginTop: 16,
  },
  groupTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    gap: 12,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.primaryTint,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  logoText: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  // Divider starts after the logo
  rowBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingRight: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },

  // ── Empty ─────────────────────────────────────
  empty: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 48,
    marginTop: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
});

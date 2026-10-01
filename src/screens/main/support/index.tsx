import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import React, { useState, useMemo } from "react";
import Text from "../../../components/common/txt";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore, { selectUserData } from "../../../store/userStore";

const BRAND = "#111111";
const BRAND_DEEP = "#0A0A0A";
const LIGHT_GREEN = "#F0F0F0";
const ACCENT_GREEN = "#CACACA";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#EBEBEB";
const SCREEN_BG = "#F8F8F8";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    id: 1,
    question: "How do I fund my wallet?",
    answer:
      "You can fund your wallet through bank transfer, card payment, or USSD. Go to Wallet > Fund Wallet and choose your preferred method.",
  },
  {
    id: 2,
    question: "How do I reset my password?",
    answer:
      "Go to Settings > Security > Change Password. Enter your current password and create a new one. You can also use 'Forgot Password?' on the login screen.",
  },
  {
    id: 3,
    question: "How to purchase data",
    answer:
      "Navigate to the Data section, select your network provider, choose a data plan, enter the phone number, and complete the payment.",
  },
  {
    id: 4,
    question: "What are the accepted payment methods?",
    answer:
      "We accept bank transfers, debit/credit cards, wallet balance, and USSD payments for all transactions.",
  },
  {
    id: 5,
    question: "Data plan comparisons",
    answer:
      "Compare data plans across different networks in the Data section. We show pricing, validity, and network coverage for each plan.",
  },
];

const CONTACT_OPTIONS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    sub: "Fastest reply",
    icon: "logo-whatsapp" as const,
    url: "https://wa.me/2349036018013",
  },
  {
    key: "email",
    label: "Email",
    sub: "hello@depay.app",
    icon: "mail-outline" as const,
    url: "mailto:hello@depay.app",
  },
  {
    key: "instagram",
    label: "Instagram",
    sub: "@depayapp",
    icon: "logo-instagram" as const,
    url: "https://instagram.com/depayapp",
  },
];

const Support = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const userData = useAuthStore(selectUserData);
  const firstName = (userData?.name ?? "there").split(" ")[0];

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const openLink = (url: string) => Linking.openURL(url);

  return (
    <View style={styles.root}>
      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.heroGreeting}>Hi {firstName},</Text>
        <Text style={styles.heroTitle}>How can we help?</Text>

        {/* Search — overlapping the header edge */}
        <View
          style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}
        >
          <Ionicons name="search-outline" size={19} color={MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for answers"
            placeholderTextColor="#ADADAD"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#C7C7C7" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── FAQS ── */}
        <Text style={styles.sectionTitle}>
          {searchQuery
            ? `Results (${filteredFaqs.length})`
            : "Common questions"}
        </Text>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={28} color="#C7C7C7" />
            <Text style={styles.emptyText}>
              No answers found for "{searchQuery}"
            </Text>
            <Text style={styles.emptySub}>
              Try different keywords, or message us below.
            </Text>
          </View>
        ) : (
          <View style={styles.faqList}>
            {filteredFaqs.map((faq, index) => {
              const isOpen = expandedFaq === faq.id;
              const isLast = index === filteredFaqs.length - 1;
              return (
                <View
                  key={faq.id}
                  style={[styles.faqItem, !isLast && styles.faqDivider]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.faqQuestionText,
                        isOpen && styles.faqQuestionOpen,
                      ]}
                    >
                      {faq.question}
                    </Text>
                    <View
                      style={[
                        styles.faqChevron,
                        isOpen && styles.faqChevronOpen,
                      ]}
                    >
                      <Ionicons
                        name={isOpen ? "remove" : "add"}
                        size={16}
                        color={isOpen ? "#FFFFFF" : BRAND}
                      />
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── CONTACT ── */}
        <Text style={styles.sectionTitle}>Still need help?</Text>
        <View style={styles.contactList}>
          {CONTACT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.contactRow,
                index !== CONTACT_OPTIONS.length - 1 && styles.faqDivider,
              ]}
              onPress={() => openLink(option.url)}
              activeOpacity={0.7}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={option.icon} size={20} color={BRAND} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{option.label}</Text>
                <Text style={styles.contactSub}>{option.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7C7" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── COMMUNITY BANNER ── */}
        <TouchableOpacity
          style={styles.communityBanner}
          activeOpacity={0.85}
          onPress={() => console.log("Join Our Community")}
        >
          <View style={styles.communityText}>
            <Text style={styles.communityTitle}>Join the Depay community</Text>
            <Text style={styles.communitySub}>
              Tips, updates and early access to new features.
            </Text>
          </View>
          <View style={styles.communityArrow}>
            <Ionicons name="arrow-forward" size={18} color={BRAND_DEEP} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Support;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },

  // ── Header ────────────────────────────────────
  header: {
    backgroundColor: BRAND,
    paddingHorizontal: 20,
    paddingBottom: 44,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  heroGreeting: {
    fontSize: 14,
    color: ACCENT_GREEN,
    fontWeight: "600",
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: -25, // overlaps the header's bottom edge
    shadowColor: BRAND_DEEP,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchContainerFocused: {
    borderWidth: 1.5,
    borderColor: ACCENT_GREEN,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: INK,
    height: "100%",
  },

  // ── Body ──────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 44, // clears the overlapping search bar
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── FAQ ───────────────────────────────────────
  faqList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  faqItem: {},
  faqDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "500",
    color: INK,
    lineHeight: 20,
  },
  faqQuestionOpen: {
    fontWeight: "700",
  },
  faqChevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  faqChevronOpen: {
    backgroundColor: BRAND,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  faqAnswerText: {
    fontSize: 13.5,
    color: MUTED,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 6,
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: INK,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },

  // ── Contact ───────────────────────────────────
  contactList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
    gap: 1,
  },
  contactLabel: {
    fontSize: 14.5,
    fontWeight: "600",
    color: INK,
  },
  contactSub: {
    fontSize: 12.5,
    color: MUTED,
  },

  // ── Community banner ──────────────────────────
  communityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: ACCENT_GREEN,
    borderRadius: 18,
    padding: 18,
  },
  communityText: {
    flex: 1,
    gap: 3,
  },
  communityTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: BRAND_DEEP,
  },
  communitySub: {
    fontSize: 12.5,
    color: "rgba(33,33,33,0.75)",
    lineHeight: 18,
  },
  communityArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

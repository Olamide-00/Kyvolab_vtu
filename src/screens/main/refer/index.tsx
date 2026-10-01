import {
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import React, { useState } from "react";
import CommonHeader from "../../../components/ui/commonHeader";
import Text from "../../../components/common/txt";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

const BRAND = "#111111";
const BRAND_DEEP = "#0A0A0A";
const LIGHT_GREEN = "#F0F0F0";
const ACCENT_GREEN = "#CACACA";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#EEEEEE";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Share your code",
    icon: "share-outline" as const,
  },
  {
    step: "2",
    title: "Friend signs up",
    icon: "person-add-outline" as const,
  },
  {
    step: "3",
    title: "You both earn",
    icon: "gift-outline" as const,
  },
];

// Milestone tiers — referrals needed → reward
const TIERS = [
  { count: 1, reward: "₦500" },
  { count: 5, reward: "₦3,000" },
  { count: 10, reward: "₦8,000" },
];

const EARNINGS = [
  {
    id: "1",
    name: "Chidi A. joined",
    date: "Yesterday, 3:25 PM",
    amount: "+₦500",
  },
  { id: "2", name: "Fatima O. joined", date: "3 days ago", amount: "+₦500" },
];

const Refer = () => {
  const [referralCode] = useState("DEPAYREF123");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const referralsCount = EARNINGS.length;
  const nextTier =
    TIERS.find((t) => t.count > referralsCount) ?? TIERS[TIERS.length - 1];
  const prevTierCount =
    [...TIERS].reverse().find((t) => t.count <= referralsCount)?.count ?? 0;
  const progress = Math.min(
    (referralsCount - prevTierCount) /
      Math.max(nextTier.count - prevTierCount, 1),
    1
  );

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join me on Depay! Use my code ${referralCode} when you sign up and we both earn rewards. 🎉`,
      });
    } catch {
      // dismissed
    }
  };

  const toggleHistory = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHistory(!showHistory);
  };

  return (
    <View style={styles.root}>
      <CommonHeader title="Referrals" back />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO — big type, code as centerpiece */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>INVITE FRIENDS</Text>
          <Text style={styles.heroTitle}>
            Earn <Text style={styles.heroTitleAccent}>₦500</Text>
            {"\n"}per referral
          </Text>

          <TouchableOpacity
            style={styles.codeBlock}
            onPress={handleCopyCode}
            activeOpacity={0.85}
          >
            <Text style={styles.codeText}>{referralCode}</Text>
            <View style={styles.codeAction}>
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={16}
                color={BRAND}
              />
              <Text style={styles.codeActionText}>
                {copied ? "Copied!" : "Tap to copy"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareCode}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social" size={17} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share invite</Text>
          </TouchableOpacity>
        </View>

        {/* HOW IT WORKS — horizontal steps */}
        <View style={styles.stepsRow}>
          {HOW_IT_WORKS.map((item, index) => (
            <React.Fragment key={item.step}>
              <View style={styles.stepItem}>
                <View style={styles.stepIconCircle}>
                  <Ionicons name={item.icon} size={18} color={BRAND} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
              </View>
              {index < HOW_IT_WORKS.length - 1 && (
                <View style={styles.stepConnector} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* MILESTONE PROGRESS */}
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneTitle}>Next reward</Text>
            <Text style={styles.milestoneCount}>
              {referralsCount}/{nextTier.count} referrals
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>

          <View style={styles.tierRow}>
            {TIERS.map((tier) => {
              const reached = referralsCount >= tier.count;
              return (
                <View key={tier.count} style={styles.tierItem}>
                  <View
                    style={[styles.tierDot, reached && styles.tierDotReached]}
                  >
                    {reached && (
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.tierLabel,
                      reached && styles.tierLabelReached,
                    ]}
                  >
                    {tier.count} · {tier.reward}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* HISTORY — plain list, no card wrapper */}
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={toggleHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.historyTitle}>
            Your referrals ({referralsCount})
          </Text>
          <Ionicons
            name={showHistory ? "chevron-up" : "chevron-down"}
            size={16}
            color={MUTED}
          />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyList}>
            {EARNINGS.length === 0 ? (
              <Text style={styles.emptyText}>
                No referrals yet — share your code to get started.
              </Text>
            ) : (
              EARNINGS.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyRow,
                    index !== EARNINGS.length - 1 && styles.historyDivider,
                  ]}
                >
                  <View style={styles.historyAvatar}>
                    <MaterialCommunityIcons
                      name="account"
                      size={16}
                      color={BRAND}
                    />
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyAmount}>{item.amount}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Refer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // ── Hero ──────────────────────────────────────
  hero: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: BRAND,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Poppins-Bold",
    color: INK,
    textAlign: "center",
    lineHeight: 37,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  heroTitleAccent: {
    color: BRAND,
  },
  codeBlock: {
    width: "100%",
    borderWidth: 2,
    borderColor: BRAND,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  codeText: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: INK,
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
    fontFamily: "Poppins-Medium",
    color: BRAND,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
  },
  shareButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },

  // ── How it works ──────────────────────────────
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 32,
  },
  stepItem: {
    alignItems: "center",
    width: 84,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 11.5,
    fontFamily: "Poppins-Medium",
    color: INK,
    textAlign: "center",
    lineHeight: 15,
  },
  stepConnector: {
    height: 1.5,
    flex: 1,
    backgroundColor: BORDER,
    marginTop: 22,
    marginHorizontal: -8,
  },

  // ── Milestones ────────────────────────────────
  milestoneSection: {
    marginTop: 36,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  milestoneTitle: {
    fontSize: 14.5,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  milestoneCount: {
    fontSize: 12.5,
    fontFamily: "Poppins-Medium",
    color: MUTED,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: LIGHT_GREEN,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: BRAND,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  tierItem: {
    alignItems: "center",
    gap: 5,
  },
  tierDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tierDotReached: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  tierLabel: {
    fontSize: 10.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
  },
  tierLabelReached: {
    color: BRAND,
    fontFamily: "Poppins-SemiBold",
  },

  // ── History ───────────────────────────────────
  historyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 36,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  historyTitle: {
    fontSize: 14.5,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  historyList: {
    marginTop: 4,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  historyDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  historyAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDetails: {
    flex: 1,
  },
  historyName: {
    fontSize: 13.5,
    fontFamily: "Poppins-Medium",
    color: INK,
  },
  historyDate: {
    fontSize: 11.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
  },
  historyAmount: {
    fontSize: 13.5,
    fontFamily: "Poppins-SemiBold",
    color: BRAND,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: MUTED,
    textAlign: "center",
    paddingVertical: 20,
  },
});

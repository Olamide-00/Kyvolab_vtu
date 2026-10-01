import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import { Field } from "../../../components/pay";
import useAuthStore from "../../../store/userStore";
import { useCreateWallet } from "../../../api/hooks/useWallet";
import { FONTS, RADIUS, THEME } from "../../../theme";

// "0123456789" → "012 345 6789"
const groupDigits = (value: string) =>
  /^\d{10}$/.test(value)
    ? `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
    : value;

const FUND_STEPS = [
  "Copy your account number",
  "Transfer any amount from any bank app",
  "Your wallet is credited automatically",
];

const PERKS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  {
    icon: "business-outline",
    text: "Receive transfers from any Nigerian bank",
  },
  { icon: "flash-outline", text: "Money lands in your wallet instantly" },
  { icon: "shield-checkmark-outline", text: "Free, secure and CBN compliant" },
];

const Wallet = () => {
  const insets = useSafeAreaInsets();
  const [bvn, setBvn] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userData = useAuthStore((state) => state.userData);
  const isWalletCreated = useAuthStore((state) => state.isWalletCreated);
  const accountDetails = useAuthStore((state) => state.accountDetails);
  const stored = accountDetails?.[0];

  // Account fields live on userData; accountDetails is the fallback
  const accountName = stored?.accountName || userData?.name || "—";
  const bankName = (userData as any)?.bankName || stored?.bankName || "—";
  const accountNumber =
    (userData as any)?.accountNumber || stored?.accountNumber || "—";
  const hasAccount =
    isWalletCreated && !!accountNumber && accountNumber !== "—";

  const email = userData?.email || "";
  const fullName = userData?.name || "";

  const splitFullName = (name: string) => {
    if (!name) return { first_name: "", last_name: "" };
    const parts = name.trim().split(" ");
    return {
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || parts[0] || "",
    };
  };

  const { first_name, last_name } = splitFullName(fullName);
  const { mutate: createWallet, isPending } = useCreateWallet();

  const isFormValid =
    agreedToTerms &&
    bvn.length === 11 &&
    phoneNumber.length >= 10 &&
    !isPending;

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Account name: ${accountName}\nBank: ${bankName}\nAccount number: ${accountNumber}`,
      });
    } catch {
      // share sheet dismissed
    }
  };

  const handleGenerateWallet = () => {
    if (bvn.length < 11) {
      Alert.alert("Validation Error", "Please enter a valid BVN (11 digits)");
      return;
    }
    if (phoneNumber.length < 10) {
      Alert.alert("Validation Error", "Please enter a valid phone number");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions");
      return;
    }

    const payload = { email, first_name, last_name, phone: phoneNumber, bvn };

    createWallet(payload, {
      onSuccess: (response) => {
        const data = response?.data;

        if (data?.accountNumber) {
          // ← Update userData with account fields directly
          useAuthStore.getState().setUserData({
            ...userData!,
            accountNumber: data.accountNumber,
            bankName: data.bankName || "",
          } as any);
          useAuthStore.getState().setIsWalletCreated(true);
          useAuthStore.getState().setAccountDetails([
            {
              accountName: data.accountName || fullName,
              accountNumber: data.accountNumber,
              bankName: data.bankName || "",
              bankCode: "",
            },
          ]);
          Alert.alert(
            "Success! 🎉",
            "Your bank account has been created successfully.",
          );
        } else {
          useAuthStore.getState().setIsWalletCreated(true);
          Alert.alert(
            "Almost there!",
            "Your account is being set up. Check back in a moment — it should be ready shortly.",
          );
        }

        setBvn("");
        setPhoneNumber("");
        setAgreedToTerms(false);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create bank account. Please try again.";
        Alert.alert("Error", message);
      },
    });
  };

  // ─── Account exists — show details ─────────────────────────
  if (hasAccount) {
    return (
      <View style={styles.root}>
        <CommonHeader title="Bank account" back />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.accountCard}>
            <View style={styles.accountTop}>
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
              <Text style={styles.bankName} numberOfLines={1}>
                {bankName}
              </Text>
            </View>

            <Text style={styles.cardLabel}>Account number</Text>
            <Text style={styles.accountNumber} numberOfLines={1}>
              {groupDigits(accountNumber)}
            </Text>

            <Text style={[styles.cardLabel, styles.nameLabel]}>
              Account name
            </Text>
            <Text style={styles.accountName} numberOfLines={1}>
              {accountName}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.action, styles.actionPrimary]}
                onPress={handleCopy}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={16}
                  color={THEME.onPrimary}
                />
                <Text style={[styles.actionText, styles.actionTextPrimary]}>
                  {copied ? "Copied" : "Copy number"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.action}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={THEME.text}
                />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>How to fund your wallet</Text>
          <View style={styles.stepsCard}>
            {FUND_STEPS.map((step, i) => (
              <View
                key={step}
                style={[
                  styles.stepRow,
                  i < FUND_STEPS.length - 1 && styles.stepDivider,
                ]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.note}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={THEME.textSecondary}
            />
            <Text style={styles.noteText}>
              This account is in your name and linked only to your wallet.
              Transfers usually reflect within 2 minutes.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Creating ──────────────────────────────────────────────
  if (isPending) {
    return (
      <View style={styles.root}>
        <CommonHeader title="Bank account" back />
        <View style={styles.loading}>
          <View style={styles.loadingBadge}>
            <ActivityIndicator color={THEME.onPrimary} />
          </View>
          <Text style={styles.loadingTitle}>Creating your account</Text>
          <Text style={styles.loadingText}>
            This can take up to 30 seconds. Please keep the app open.
          </Text>
          <View style={styles.loadingSteps}>
            {[
              "Verifying your BVN",
              "Setting up account",
              "Linking to wallet",
            ].map((step) => (
              <View key={step} style={styles.loadingStep}>
                <View style={styles.loadingDot} />
                <Text style={styles.loadingStepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ─── Creation form ─────────────────────────────────────────
  return (
    <View style={styles.root}>
      <CommonHeader title="Bank account" back />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Get your own{"\n"}account number</Text>
          <Text style={styles.subtitle}>
            A dedicated bank account, in your name, for funding your wallet.
          </Text>

          <View style={styles.perks}>
            {PERKS.map((perk) => (
              <View key={perk.text} style={styles.perk}>
                <View style={styles.perkIcon}>
                  <Ionicons name={perk.icon} size={16} color={THEME.text} />
                </View>
                <Text style={styles.perkText}>{perk.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.fieldLabel}>BVN</Text>
          <Field
            icon="finger-print-outline"
            value={bvn}
            onChangeText={(t) => setBvn(t.replace(/[^0-9]/g, ""))}
            placeholder="11-digit BVN"
            keyboardType="number-pad"
            maxLength={11}
            status={bvn.length === 11 ? "success" : "idle"}
            right={
              bvn.length < 11 ? (
                <Text style={styles.counter}>{bvn.length}/11</Text>
              ) : null
            }
          />
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Need Help?",
                "Dial *565*0# on your registered number or contact your bank for assistance.",
              )
            }
            hitSlop={8}
          >
            <Text style={styles.hint}>
              Don't know it? Dial <Text style={styles.hintBold}>*565*0#</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Phone number</Text>
          <Field
            icon="call-outline"
            value={phoneNumber}
            onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ""))}
            placeholder="Linked to your BVN"
            keyboardType="phone-pad"
            maxLength={11}
            status={phoneNumber.length >= 10 ? "success" : "idle"}
          />

          <TouchableOpacity
            style={[styles.consent, agreedToTerms && styles.consentOn]}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxOn]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={13} color={THEME.onPrimary} />
              )}
            </View>
            <Text style={styles.consentText}>
              I consent to sharing my BVN, phone number and personal details to
              create this account, in line with CBN requirements. They will
              never be sold or shared.
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.buttonOff]}
            onPress={handleGenerateWallet}
            disabled={!isFormValid}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Create account</Text>
            <Ionicons name="arrow-forward" size={17} color={THEME.onPrimary} />
          </TouchableOpacity>
          <View style={styles.secure}>
            <Ionicons name="lock-closed" size={11} color={THEME.textMuted} />
            <Text style={styles.secureText}>Encrypted end to end</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ── Account card ──────────────────────────────
  accountCard: {
    padding: 20,
    borderRadius: RADIUS.hero,
    backgroundColor: THEME.accent,
  },
  accountTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.text,
  },
  activeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  bankName: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  cardLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },
  nameLabel: {
    marginTop: 14,
  },
  accountNumber: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: 2,
    marginTop: 2,
  },
  accountName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: THEME.text,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.primaryMuted,
  },
  actionPrimary: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  actionText: {
    fontSize: 14.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  actionTextPrimary: {
    color: THEME.onPrimary,
  },

  sectionTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  stepsCard: {
    paddingHorizontal: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  stepDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: THEME.text,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.text,
  },
  note: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  // ── Loading ───────────────────────────────────
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  loadingBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    textAlign: "center",
  },
  loadingSteps: {
    marginTop: 24,
    alignSelf: "stretch",
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  loadingStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.primaryMuted,
  },
  loadingStepText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  // ── Form ──────────────────────────────────────
  title: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  perks: {
    marginTop: 18,
    gap: 10,
    padding: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.accent,
  },
  perk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  perkText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: THEME.text,
  },
  fieldLabel: {
    marginTop: 22,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  counter: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  hint: {
    marginTop: 8,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  hintBold: {
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  consent: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  consentOn: {
    borderColor: THEME.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: THEME.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  consentText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
  },
  buttonOff: {
    opacity: 0.25,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },
  secure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  secureText: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
});

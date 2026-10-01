import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../../../store/userStore";
import Text from "../../../../components/common/txt";
import { FONTS, RADIUS, THEME } from "../../../../theme";

const { width } = Dimensions.get("window");
const TICKET_WIDTH = Math.min(width - 40, 380);
const NOTCH = 22;

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
}

type CopyKey = "number" | "name" | "bank" | null;

// "0123456789" → "012 345 6789"
const groupDigits = (value: string) =>
  /^\d{10}$/.test(value)
    ? `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
    : value;

const TopUpModal: React.FC<TopUpModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();

  const backdrop = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const lift = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const [rendered, setRendered] = useState(visible);
  const [copied, setCopied] = useState<CopyKey>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userData = useAuthStore((state) => state.userData);
  const isWalletCreated = useAuthStore((state) => state.isWalletCreated);

  const accountName = userData?.name || "—";
  const bankName = (userData as any)?.bankName || "—";
  const accountNumber = (userData as any)?.accountNumber || "—";

  const hasAccount =
    isWalletCreated && !!accountNumber && accountNumber !== "—";

  // ── Open / close: backdrop fades, ticket pops from slightly below ──
  useEffect(() => {
    if (visible) {
      setRendered(true);
      scale.setValue(0.88);
      lift.setValue(24);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 90,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.spring(lift, {
          toValue: 0,
          tension: 90,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setRendered(false));
    }
  }, [visible]);

  // ── "Listening for transfer" pulse ring ──
  useEffect(() => {
    if (!visible || !hasAccount) return;
    pulse.setValue(0);
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, hasAccount]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleCopy = async (key: Exclude<CopyKey, null>, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopied(key);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 1800);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Account name: ${accountName}\nBank: ${bankName}\nAccount number: ${accountNumber}`,
      });
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  const handleMoneySent = async () => {
    if (!copied && accountNumber !== "—") {
      await Clipboard.setStringAsync(accountNumber);
    }
    onClose();
  };

  const handleCreateAccount = () => {
    onClose();
    navigation.navigate("StackNav", { screen: "Wallet" });
  };

  if (!rendered) return null;

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const DetailRow = ({
    icon,
    label,
    value,
    copyKey,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    copyKey: Exclude<CopyKey, null>;
  }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={17} color={THEME.primary} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleCopy(copyKey, value)}
        hitSlop={8}
        style={styles.detailCopy}
        activeOpacity={0.7}
      >
        <Ionicons
          name={copied === copyKey ? "checkmark" : "copy-outline"}
          size={16}
          color={THEME.primary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.ticketWrap,
                {
                  transform: [{ translateY: lift }, { scale }],
                },
              ]}
            >
              {!hasAccount ? (
                /* ── No account yet ── */
                <View style={[styles.ticket, styles.emptyTicket]}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="card-outline"
                      size={30}
                      color={THEME.onPrimary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    Get your account number
                  </Text>
                  <Text style={styles.emptyBody}>
                    You need a personal account number before you can add
                    money by bank transfer. It only takes a minute.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleCreateAccount}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonText}>
                      Create account
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} hitSlop={8}>
                    <Text style={styles.laterText}>Maybe later</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ticket}>
                  {/* ── Stub: account number ── */}
                  <View style={styles.stub}>
                    <View style={styles.stubTopRow}>
                      <Text style={styles.stubEyebrow}>ADD MONEY</Text>
                      <TouchableOpacity
                        onPress={onClose}
                        hitSlop={10}
                        style={styles.closeButton}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color={THEME.onPrimary}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.stubHint}>
                      Transfer any amount to
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleCopy("number", accountNumber)}
                    >
                      <Text
                        style={styles.bigNumber}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {groupDigits(accountNumber)}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.tapHint}>
                      <Ionicons
                        name={
                          copied === "number" ? "checkmark-circle" : "copy"
                        }
                        size={12}
                        color={THEME.onPrimaryMuted}
                      />
                      <Text style={styles.tapHintText}>
                        {copied === "number" ? "Copied" : "Tap number to copy"}
                      </Text>
                    </View>
                  </View>

                  {/* ── Perforation with side notches ── */}
                  <View style={styles.perforation}>
                    {/* Each notch is clipped to its inner half so only
                        the cut-out edge shows, not an arc on the backdrop */}
                    <View style={[styles.notchClip, styles.notchClipLeft]}>
                      <View style={[styles.notch, styles.notchLeft]} />
                    </View>
                    <View style={styles.dashes} />
                    <View style={[styles.notchClip, styles.notchClipRight]}>
                      <View style={styles.notch} />
                    </View>
                  </View>

                  {/* ── Body: details ── */}
                  <View style={styles.body}>
                    <DetailRow
                      icon="business-outline"
                      label="Bank"
                      value={bankName}
                      copyKey="bank"
                    />
                    <DetailRow
                      icon="person-outline"
                      label="Account name"
                      value={accountName}
                      copyKey="name"
                    />

                    <View style={styles.listening}>
                      <View style={styles.pulseWrap}>
                        <Animated.View
                          style={[
                            styles.pulseRing,
                            {
                              opacity: pulseOpacity,
                              transform: [{ scale: pulseScale }],
                            },
                          ]}
                        />
                        <View style={styles.pulseDot} />
                      </View>
                      <Text style={styles.listeningText}>
                        Credited automatically within 2 minutes
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleShare}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="share-social-outline"
                          size={17}
                          color={THEME.primary}
                        />
                        <Text style={styles.secondaryButtonText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.primaryButton, styles.flexButton]}
                        onPress={handleMoneySent}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.primaryButtonText}>
                          I've sent it
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Solid so the ticket notches (filled with this color) read as true cut-outs
const BACKDROP = THEME.bg;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  ticketWrap: {
    width: TICKET_WIDTH,
  },
  ticket: {
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  // ── Stub ──────────────────────────────────────
  stub: {
    backgroundColor: THEME.primary,
    // sit inside the ticket's 1px border
    borderTopLeftRadius: RADIUS.xl - 1,
    borderTopRightRadius: RADIUS.xl - 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
    alignItems: "center",
  },
  stubTopRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  stubEyebrow: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
    color: THEME.onPrimaryMuted,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  stubHint: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.onPrimaryMuted,
    marginBottom: 6,
  },
  bigNumber: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
    letterSpacing: 2,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  tapHintText: {
    fontSize: 11.5,
    fontFamily: FONTS.semibold,
    color: THEME.onPrimaryMuted,
  },

  // ── Perforation ───────────────────────────────
  perforation: {
    height: NOTCH,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
  },
  // Circles filled with the backdrop color read as cut-outs
  notch: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: BACKDROP,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  notchClip: {
    width: NOTCH / 2 + 1,
    height: NOTCH,
    overflow: "hidden",
  },
  // Pull 1px outward so the notch covers the ticket's own border line
  notchClipLeft: {
    marginLeft: -1,
  },
  notchClipRight: {
    marginRight: -1,
  },
  notchLeft: {
    marginLeft: -NOTCH / 2,
  },
  dashes: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.primarySoft,
  },

  // ── Body ──────────────────────────────────────
  body: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 18,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.primaryTint,
    borderWidth: 1,
    borderColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  detailValue: {
    fontSize: 15.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  detailCopy: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },

  listening: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: THEME.primaryTint,
  },
  pulseWrap: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.primary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
  },
  listeningText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: THEME.primary,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: THEME.primary,
  },
  primaryButton: {
    height: 52,
    alignSelf: "stretch",
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  flexButton: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },

  // ── No account ────────────────────────────────
  emptyTicket: {
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontFamily: FONTS.bold,
    color: THEME.text,
    textAlign: "center",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  laterText: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.textMuted,
  },
});

export default TopUpModal;

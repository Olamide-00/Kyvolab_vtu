import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Alert,
  Image,
  Share,
  Platform,
} from "react-native";
import React, { useRef } from "react";
import { COLORS } from "../../../constants/Colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../../store/userStore";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Text from "../../../components/common/txt";

const Receipt = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const transaction = route.params?.transaction || {};
  const receiptRef = useRef<any>(null);

  const userData = useAuthStore((state) => state.userData);

  const label = transaction.service || transaction.label || "Transaction";
  const amount = parseFloat(transaction.amount) || 0;
  const rawStatus = transaction.status || "pending";
  const status = rawStatus.toUpperCase();
  const category = transaction.service || transaction.category || "wallet";
  const dateStr = transaction.transaction_date || transaction.date || "";
  const displayDate = dateStr
    ? new Date(dateStr).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "---";
  const transactionId =
    transaction.transaction_id ||
    transaction.transactionReference ||
    transaction._id ||
    transaction.id ||
    "---";
  const beneficiary =
    transaction.unique_element ||
    transaction.beneficiary ||
    transaction.phone ||
    transaction.email ||
    userData?.email ||
    "---";
  const referralCode = userData?.tag ? `Depay${userData.tag}` : "DEPAYREF123";
  const isSuccess = status === "SUCCESS";
  const isPending = status === "PENDING";
  const statusLabel = isSuccess
    ? "Successful"
    : isPending
      ? "Processing"
      : status.charAt(0) + status.slice(1).toLowerCase();
  const serviceCharge = Number(transaction.fee) || 0;
  const cashbackEarned = isSuccess
    ? Number(transaction.commissionEarned) || 0
    : 0;
  const naira = (value: number) =>
    `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Helpers for optional fields ──
  const isValidValue = (v: any) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    if (s === "") return false;
    const upper = s.toUpperCase();
    if (upper === "N/A" || upper === "NULL" || upper === "UNDEFINED")
      return false;
    return true;
  };

  const handleCopy = (value: string, label = "Value") => {
    Clipboard.setString(value);
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  const handleCopyId = () => {
    handleCopy(transactionId, "Transaction ID");
  };

  const handleCopyReferral = () => {
    handleCopy(referralCode, "Referral code");
  };

  // ── Electricity-specific fields (only shown if present) ──
  const rawToken = transaction.token || transaction.purchased_code || "";
  const cleanToken = String(rawToken)
    .replace(/^Token\s*:\s*/i, "")
    .trim();

  const electricityRows = [
    isValidValue(cleanToken) && {
      label: "Token",
      value: cleanToken,
      copyLabel: "Token",
    },
    isValidValue(transaction.units) && {
      label: "Units",
      value: String(transaction.units),
    },
    isValidValue(transaction.meterNumber) && {
      label: "Meter Number",
      value: String(transaction.meterNumber),
      copyLabel: "Meter number",
    },
    isValidValue(transaction.customerName) && {
      label: "Customer Name",
      value: String(transaction.customerName),
    },
    isValidValue(transaction.customerAddress) && {
      label: "Customer Address",
      value: String(transaction.customerAddress),
    },
    isValidValue(transaction.tariff) && {
      label: "Tariff",
      value: String(transaction.tariff),
    },
    isValidValue(transaction.utilityName) && {
      label: "Utility",
      value: String(transaction.utilityName),
    },
    isValidValue(transaction.tokenAmount) && {
      label: "Token Amount",
      value: `₦${Number(transaction.tokenAmount).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
      })}`,
    },
    isValidValue(transaction.exchangeReference) && {
      label: "Exchange Reference",
      value: String(transaction.exchangeReference),
      copyLabel: "Exchange reference",
    },
  ].filter(Boolean) as { label: string; value: string; copyLabel?: string }[];

  const hasElectricityDetails = electricityRows.length > 0;

  // ── Education / Result Checker cards (WAEC, NECO, NABTEB, JAMB, etc.) ──
  // Primary source: transaction.cards -> [{ Serial, Pin }, ...]
  // Fallback: parse transaction.purchased_code, e.g.
  //   "Serial No:WRN123456790, pin: 098765432112"
  const rawCards: any[] = Array.isArray(transaction.cards)
    ? transaction.cards
    : [];

  const parsedFallbackCard = (() => {
    if (rawCards.length > 0) return null; // cards array already covers it
    const raw = String(transaction.purchased_code || "");
    const serialMatch = raw.match(/Serial\s*No\s*:\s*([^,]+)/i);
    const pinMatch = raw.match(/pin\s*:\s*([^\s,]+)/i);
    const serial = serialMatch?.[1]?.trim();
    const pin = pinMatch?.[1]?.trim();
    if (isValidValue(serial) || isValidValue(pin)) {
      return { Serial: serial, Pin: pin };
    }
    return null;
  })();

  const educationCards: { Serial?: string; Pin?: string }[] =
    rawCards.length > 0
      ? rawCards
      : parsedFallbackCard
        ? [parsedFallbackCard]
        : [];

  const educationRows = educationCards.flatMap((card, index) => {
    const prefix = educationCards.length > 1 ? `Card ${index + 1} — ` : "";
    const rows: { label: string; value: string; copyLabel?: string }[] = [];

    if (isValidValue(card?.Serial)) {
      rows.push({
        label: `${prefix}Serial No.`,
        value: String(card.Serial),
        copyLabel: "Serial number",
      });
    }
    if (isValidValue(card?.Pin)) {
      rows.push({
        label: `${prefix}PIN`,
        value: String(card.Pin),
        copyLabel: "PIN",
      });
    }
    return rows;
  });

  const productName =
    transaction.content?.transactions?.product_name ||
    transaction.product_name ||
    "";

  if (isValidValue(productName)) {
    educationRows.unshift({ label: "Product", value: String(productName) });
  }

  const hasEducationDetails = educationRows.length > 0;

  const handleDownload = async () => {
    try {
      const { status: permStatus } =
        await MediaLibrary.requestPermissionsAsync();
      if (permStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to save the receipt.",
        );
        return;
      }
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved!", "Receipt saved to your photo gallery.");
    } catch (e) {
      Alert.alert("Error", "Could not save receipt. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        await Share.share({
          message: `Depay Transaction Receipt\n\nType: ${category}\nAmount: ₦${amount.toLocaleString(
            "en-NG",
            { minimumFractionDigits: 2 },
          )}\nStatus: ${status}\nDate: ${displayDate}\nTransaction ID: ${transactionId}`,
          title: "Transaction Receipt",
        });
        return;
      }
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Receipt",
        UTI: "public.png",
      });
    } catch (e) {
      Alert.alert("Error", "Could not share receipt. Please try again.");
    }
  };

  const DetailRow = ({
    label,
    value,
    valueColor,
    onPress,
    showCopy,
    last = false,
  }: {
    label: string;
    value: string;
    valueColor?: string;
    onPress?: () => void;
    showCopy?: boolean;
    last?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.detailRow, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text size="xs" color="#9A9A9A" style={styles.detailLabel}>
        {label}
      </Text>
      <View style={styles.detailValueRow}>
        <Text
          size="xs"
          variant="semibold"
          color={valueColor || "#1A1A1A"}
          style={styles.detailValue}
        >
          {value}
        </Text>
        {showCopy && (
          <MaterialCommunityIcons
            name="content-copy"
            size={12}
            color={COLORS.brand}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#1A1A1A"
          />
        </TouchableOpacity>
        <Text variant="semibold" size="md" color="#1A1A1A">
          Receipt
        </Text>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={20}
            color={COLORS.brand}
          />
        </TouchableOpacity>
      </View>

      {/* ViewShot */}
      <ViewShot ref={receiptRef} options={{ format: "png", quality: 1 }}>
        <View style={styles.captureWrapper}>
          {/* Top card — amount + status */}
          <View style={styles.topCard}>
            <Image
              source={require("../../../../assets/images/DEPAYLOGO.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text size="xs" color="#9A9A9A" style={{ marginTop: 12 }}>
              {label}
            </Text>

            <Text
              variant="bold"
              size="3xl"
              color="#1A1A1A"
              style={styles.amount}
            >
              ₦
              {amount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>

            {/* Status badge */}
            <View
              style={[
                styles.statusBadge,
                !isSuccess && styles.statusBadgeFailed,
              ]}
            >
              <View
                style={[styles.statusDot, !isSuccess && styles.statusDotFailed]}
              />
              <Text
                size="xs"
                variant="semibold"
                color={isSuccess ? "#7F7F7F" : "#4D4D4D"}
              >
                {statusLabel}
              </Text>
              <MaterialCommunityIcons
                name={
                  isSuccess
                    ? "check-circle"
                    : isPending
                      ? "clock-outline"
                      : "close-circle"
                }
                size={13}
                color={isSuccess ? "#9B9B9B" : "#686868"}
              />
            </View>

            {/* Torn edge */}
            <View style={styles.tornRow}>
              <View style={styles.tornCircleLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.tornCircleRight} />
            </View>
          </View>

          {/* Details card */}
          <View style={styles.detailsCard}>
            <Text
              variant="semibold"
              size="sm"
              color="#1A1A1A"
              style={styles.sectionTitle}
            >
              Transaction Details
            </Text>

            <DetailRow
              label="Transaction Type"
              value={category.charAt(0).toUpperCase() + category.slice(1)}
            />
            <DetailRow label="Beneficiary" value={beneficiary} />
            <DetailRow
              label="Amount"
              value={`₦${amount.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}`}
            />
            {serviceCharge > 0 && (
              <DetailRow label="Service Charge" value={naira(serviceCharge)} />
            )}
            {cashbackEarned > 0 && (
              <DetailRow
                label="Cashback Earned"
                value={naira(cashbackEarned)}
              />
            )}
            <DetailRow
              label="Status"
              value={statusLabel === "Successful" ? "Success" : statusLabel}
              valueColor={isSuccess ? "#9B9B9B" : "#686868"}
            />
            <DetailRow
              label="Transaction ID"
              value={
                transactionId.length > 16
                  ? transactionId.slice(0, 16) + "..."
                  : transactionId
              }
              onPress={handleCopyId}
              showCopy
            />
            <DetailRow
              label="Date"
              value={displayDate}
              last={!hasElectricityDetails && !hasEducationDetails}
            />
          </View>

          {/* Electricity details card — only rendered if there's something to show */}
          {hasElectricityDetails && (
            <View style={styles.detailsCard}>
              <Text
                variant="semibold"
                size="sm"
                color="#1A1A1A"
                style={styles.sectionTitle}
              >
                Electricity Details
              </Text>

              {electricityRows.map((row, index) => (
                <DetailRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  onPress={
                    row.copyLabel
                      ? () => handleCopy(row.value, row.copyLabel)
                      : undefined
                  }
                  showCopy={!!row.copyLabel}
                  last={index === electricityRows.length - 1}
                />
              ))}
            </View>
          )}

          {/* Education / Result Checker details card — WAEC, NECO, JAMB, etc. */}
          {hasEducationDetails && (
            <View style={styles.detailsCard}>
              <Text
                variant="semibold"
                size="sm"
                color="#1A1A1A"
                style={styles.sectionTitle}
              >
                PIN Details
              </Text>

              {educationRows.map((row, index) => (
                <DetailRow
                  key={`${row.label}-${index}`}
                  label={row.label}
                  value={row.value}
                  onPress={
                    row.copyLabel
                      ? () => handleCopy(row.value, row.copyLabel)
                      : undefined
                  }
                  showCopy={!!row.copyLabel}
                  last={index === educationRows.length - 1}
                />
              ))}
            </View>
          )}

          {/* Referral card
          <View style={styles.referralCard}>
            <Text size="xs" color="#9A9A9A" style={{ marginBottom: 8 }}>
              Share your referral code to earn bonus rewards
            </Text>
            <View style={styles.referralCodeRow}>
              <Text
                variant="bold"
                size="md"
                color="#1A1A1A"
                style={{ letterSpacing: 0.5 }}
              >
                {referralCode}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopyReferral}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={14}
                  color={COLORS.brand}
                />
                <Text size="xs" variant="semibold" color={COLORS.brand}>
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}
        </View>
      </ViewShot>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDownload}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="download-outline"
            size={18}
            color="#3A3A3A"
          />
          <Text size="sm" variant="semibold" color="#3A3A3A">
            Download
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="share-variant-outline"
            size={18}
            color="#3A3A3A"
          />
          <Text size="sm" variant="semibold" color="#3A3A3A">
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Done */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate("TabNav", { screen: "HomeTab" })}
        activeOpacity={0.85}
      >
        <Text variant="bold" size="md" color="#fff">
          Done
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: 36,
  },

  // ── Header ────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: "#F5F5F5",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },

  // ── Capture wrapper ───────────────────────────
  captureWrapper: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    gap: 2,
  },

  // ── Top card ──────────────────────────────────
  topCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#EFEFEF",
  },
  logo: {
    width: 72,
    height: 24,
  },
  amount: {
    marginTop: 4,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E7E7E7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusBadgeFailed: {
    backgroundColor: "#F5F5F5",
    borderColor: "#D5D5D5",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111111",
  },
  statusDotFailed: {
    backgroundColor: "#686868",
  },

  // Torn ticket edge
  tornRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  tornCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginLeft: -10,
  },
  tornCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginRight: -10,
  },
  dashedLine: {
    flex: 1,
    borderTopWidth: 1.5,
    borderColor: "#EFEFEF",
    borderStyle: "dashed",
  },

  // ── Details card ──────────────────────────────
  detailsCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#EFEFEF",
  },
  sectionTitle: {
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailLabel: {
    flex: 1,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    justifyContent: "flex-end",
  },
  detailValue: {
    textAlign: "right",
  },

  // ── Referral card ─────────────────────────────
  referralCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  referralCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  // ── Action buttons ────────────────────────────
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#fff",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── Done button ───────────────────────────────
  doneButton: {
    backgroundColor: COLORS.brand,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
});

export default Receipt;

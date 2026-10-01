// Shared building blocks for the bill-payment screens (airtime, data,
// electricity, TV, education). Every pay screen is the same shape:
// numbered steps in a scroll view, and a pinned footer with the total.
import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommonHeader from "../ui/commonHeader";
import Text from "../common/txt";
import { FONTS, RADIUS, THEME } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

export const formatNaira = (value: number | string) => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!n || isNaN(n)) return "₦0";
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
};

// ─── Screen shell ──────────────────────────────────────────────

interface PayScreenProps {
  title: string;
  subtitle?: string;
  /** Rendered above the steps, outside the scroll padding (e.g. a toggle) */
  top?: React.ReactNode;
  children: React.ReactNode;
  totalLabel?: string;
  total?: number | string;
  buttonLabel?: string;
  disabled?: boolean;
  onContinue: () => void;
}

export const PayScreen = ({
  title,
  subtitle,
  top,
  children,
  totalLabel = "Total",
  total,
  buttonLabel = "Continue",
  disabled,
  onContinue,
}: PayScreenProps) => {
  const insets = useSafeAreaInsets();
  const hasTotal = total !== undefined && Number(total) > 0;

  return (
    <View style={styles.root}>
      <CommonHeader title={title} subtitle={subtitle} back />
      {top}
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
          {children}
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View style={styles.footerSummary}>
            <Text style={styles.footerLabel}>{totalLabel}</Text>
            <Text style={styles.footerTotal}>
              {hasTotal ? formatNaira(total!) : "—"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.footerButton, disabled && styles.footerButtonOff]}
            onPress={onContinue}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Text style={styles.footerButtonText}>{buttonLabel}</Text>
            <Ionicons name="arrow-forward" size={17} color={THEME.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Numbered step ─────────────────────────────────────────────

interface StepProps {
  index: number;
  title: string;
  done?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export const Step = ({ index, title, done, hint, children }: StepProps) => (
  <View style={styles.step}>
    <View style={styles.stepHeader}>
      <View style={[styles.stepBadge, done && styles.stepBadgeDone]}>
        {done ? (
          <Ionicons name="checkmark" size={13} color={THEME.onPrimary} />
        ) : (
          <Text style={styles.stepNumber}>{index}</Text>
        )}
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
      {hint ? <Text style={styles.stepHint}>{hint}</Text> : null}
    </View>
    {children}
  </View>
);

// ─── Segmented toggle ──────────────────────────────────────────

interface SegmentProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segment<T extends string>({
  options,
  value,
  onChange,
}: SegmentProps<T>) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            style={[styles.segmentItem, active && styles.segmentActive]}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Provider tiles ────────────────────────────────────────────

export interface ProviderOption {
  label: string;
  value: string;
  image?: string;
}

interface ProviderPickerProps {
  options: ProviderOption[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export const ProviderPicker = ({
  options,
  value,
  onChange,
  loading,
}: ProviderPickerProps) => {
  if (loading && options.length === 0) {
    return (
      <View style={styles.providerRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.providerTile}>
            <View style={[styles.providerLogo, styles.skeleton]} />
            <View style={styles.skeletonLabel} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.providerRow}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            style={styles.providerTile}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
          >
            <View style={[styles.providerLogo, active && styles.providerActive]}>
              {o.image ? (
                <Image
                  source={{ uri: o.image }}
                  style={styles.providerImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.providerInitials}>
                  {o.label.slice(0, 2).toUpperCase()}
                </Text>
              )}
              {active && (
                <View style={styles.providerCheck}>
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color={THEME.onPrimary}
                  />
                </View>
              )}
            </View>
            <Text
              style={[styles.providerLabel, active && styles.providerLabelOn]}
              numberOfLines={2}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// ─── Text field with verification state ────────────────────────

export type FieldStatus = "idle" | "loading" | "success" | "error";

interface FieldProps extends TextInputProps {
  icon?: IconName;
  status?: FieldStatus;
  message?: string;
  right?: React.ReactNode;
}

export const Field = ({
  icon,
  status = "idle",
  message,
  right,
  style,
  ...input
}: FieldProps) => (
  <View>
    <View
      style={[
        styles.field,
        status === "success" && styles.fieldSuccess,
        status === "error" && styles.fieldError,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={THEME.textMuted} />
      ) : null}
      <TextInput
        placeholderTextColor={THEME.textMuted}
        style={[styles.fieldInput, style]}
        {...input}
      />
      {status === "loading" ? (
        <ActivityIndicator size="small" color={THEME.primary} />
      ) : status === "success" ? (
        <Ionicons name="checkmark-circle" size={20} color={THEME.primary} />
      ) : null}
      {right}
    </View>
    {message ? (
      <View
        style={[
          styles.message,
          status === "success" && styles.messageSuccess,
        ]}
      >
        {status === "success" ? (
          <Ionicons name="person" size={13} color={THEME.onPrimary} />
        ) : status === "error" ? (
          <Ionicons name="alert-circle" size={13} color={THEME.textSecondary} />
        ) : null}
        <Text
          style={[
            styles.messageText,
            status === "success" && styles.messageTextSuccess,
          ]}
          numberOfLines={1}
        >
          {message}
        </Text>
      </View>
    ) : null}
  </View>
);

// ─── Big amount entry ──────────────────────────────────────────

interface AmountEntryProps {
  value: string;
  onChange?: (value: string) => void;
  quick?: number[];
  /** Locked amounts are set by a plan/package and can't be typed */
  locked?: boolean;
  caption?: string;
}

export const AmountEntry = ({
  value,
  onChange,
  quick,
  locked,
  caption,
}: AmountEntryProps) => (
  <View style={styles.amountCard}>
    <View style={styles.amountRow}>
      <Text style={[styles.amountCurrency, !value && styles.amountEmpty]}>
        ₦
      </Text>
      {locked ? (
        <Text style={[styles.amountInput, !value && styles.amountEmpty]}>
          {value ? Number(value).toLocaleString("en-NG") : "0"}
        </Text>
      ) : (
        <TextInput
          value={value}
          onChangeText={(t) => onChange?.(t.replace(/[^0-9]/g, ""))}
          placeholder="0"
          placeholderTextColor={THEME.primaryMuted}
          keyboardType="number-pad"
          style={styles.amountInput}
          maxLength={7}
        />
      )}
    </View>
    {caption ? (
      <View style={styles.amountCaption}>
        {locked ? (
          <Ionicons name="lock-closed" size={11} color={THEME.textMuted} />
        ) : null}
        <Text style={styles.amountCaptionText}>{caption}</Text>
      </View>
    ) : null}

    {quick && !locked ? (
      <View style={styles.quickRow}>
        {quick.map((q) => {
          const active = value === String(q);
          return (
            <TouchableOpacity
              key={q}
              style={[styles.quickChip, active && styles.quickChipActive]}
              onPress={() => onChange?.(String(q))}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickText, active && styles.quickTextOn]}>
                {q >= 1000 ? `${q / 1000}k` : q}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null}
  </View>
);

// ─── Selectable plan / package cards ───────────────────────────

export interface PlanOption {
  value: string;
  title: string;
  subtitle?: string;
  price?: number | string;
}

interface PlanPickerProps {
  options: PlanOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
  loading?: boolean;
  emptyText?: string;
}

export const PlanPicker = ({
  options,
  value,
  onChange,
  columns = 1,
  loading,
  emptyText = "Nothing to show yet",
}: PlanPickerProps) => {
  if (loading) {
    return (
      <View style={styles.planEmpty}>
        <ActivityIndicator color={THEME.primary} />
      </View>
    );
  }
  if (options.length === 0) {
    return (
      <View style={styles.planEmpty}>
        <Text style={styles.planEmptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.planWrap, columns === 2 && styles.planGrid]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            style={[
              styles.planCard,
              columns === 2 && styles.planCardHalf,
              active && styles.planCardActive,
            ]}
            onPress={() => onChange(o.value)}
            activeOpacity={0.85}
          >
            <View style={styles.planText}>
              <Text
                style={[styles.planTitle, active && styles.onDark]}
                numberOfLines={columns === 2 ? 3 : 2}
              >
                {o.title}
              </Text>
              {o.subtitle ? (
                <Text
                  style={[styles.planSubtitle, active && styles.onDarkMuted]}
                  numberOfLines={1}
                >
                  {o.subtitle}
                </Text>
              ) : null}
            </View>
            {o.price !== undefined ? (
              <Text
                style={[
                  styles.planPrice,
                  columns === 2 && styles.planPriceGrid,
                  active && styles.onDark,
                ]}
              >
                {formatNaira(o.price)}
              </Text>
            ) : null}
            {columns === 1 ? (
              <View style={[styles.radio, active && styles.radioOn]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  footerSummary: { flex: 1 },
  footerLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  footerTotal: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.3,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 52,
    paddingHorizontal: 26,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
  },
  footerButtonOff: { opacity: 0.25 },
  footerButtonText: {
    fontSize: 15.5,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },

  // Step
  step: { marginTop: 22 },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.text,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeDone: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.2,
  },
  stepHint: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },

  // Segment
  segment: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 4,
    padding: 3,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  segmentActive: { backgroundColor: THEME.primary },
  segmentText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  segmentTextActive: { color: THEME.onPrimary },

  // Providers
  providerRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 16,
  },
  providerTile: {
    width: 74,
    alignItems: "center",
    gap: 8,
  },
  providerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  providerActive: {
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  providerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerInitials: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  providerCheck: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    borderWidth: 2,
    borderColor: THEME.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  providerLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
    textAlign: "center",
  },
  providerLabelOn: {
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  skeleton: { backgroundColor: THEME.primarySoft, borderWidth: 0 },
  skeletonLabel: {
    width: 44,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.primarySoft,
  },

  // Field
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    paddingHorizontal: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  fieldSuccess: { borderColor: THEME.primary },
  fieldError: { borderColor: THEME.textMuted, borderStyle: "dashed" },
  fieldInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: THEME.text,
    letterSpacing: 0.5,
  },
  message: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 8,
    paddingVertical: 5,
  },
  messageSuccess: {
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
  },
  messageText: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },
  messageTextSuccess: {
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },

  // Amount
  amountCard: {
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  amountCurrency: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: THEME.text,
    marginRight: 4,
  },
  amountInput: {
    minWidth: 40,
    fontSize: 44,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -1,
    padding: 0,
    textAlign: "center",
  },
  amountEmpty: { color: THEME.primaryMuted },
  amountCaption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  amountCaptionText: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },
  quickChip: {
    minWidth: 58,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quickChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  quickText: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
  quickTextOn: { color: THEME.onPrimary },

  // Plans
  planWrap: { gap: 8 },
  planGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  planCardHalf: {
    // two columns with an 8px gap
    width: "48.7%",
    minHeight: 104,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  planCardActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  planText: { flex: 1, gap: 2 },
  planTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.text,
    lineHeight: 19,
  },
  planSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  planPrice: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  planPriceGrid: { fontSize: 17, marginTop: 8 },
  onDark: { color: THEME.onPrimary },
  onDarkMuted: { color: THEME.onPrimaryMuted },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: THEME.onPrimary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.onPrimary,
  },
  planEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.border,
  },
  planEmptyText: {
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
});

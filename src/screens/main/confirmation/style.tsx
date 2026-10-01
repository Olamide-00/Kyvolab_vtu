// style.ts
import { StyleSheet } from "react-native";
import { FONTS, RADIUS, SHADOW, THEME } from "../../../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // ── Icon + heading ──
  iconSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewText: {
    color: THEME.text,
    fontSize: 22,
    fontFamily: FONTS.bold,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  reviewSubtext: {
    color: THEME.textMuted,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },

  // ── Details card ──
  detailsCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    padding: 12,
    ...SHADOW.card,
  },

  // Indigo "ticket" holding the total
  amountSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 22,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.primary,
    overflow: "hidden",
  },
  amountLabel: {
    color: THEME.onPrimaryMuted,
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  amountLoader: {
    marginVertical: 12,
  },
  amountValue: {
    color: THEME.onPrimary,
    fontSize: 34,
    fontFamily: FONTS.bold,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  amountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: THEME.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  amountBadgeText: {
    color: THEME.primaryDarkest,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 8,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerLabel: {
    color: THEME.textMuted,
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 1.2,
  },

  itemContainer: {
    gap: 6,
    marginBottom: 12,
  },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: THEME.accentSoft,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  noteText: {
    flex: 1,
    color: THEME.primaryDarkest,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  chargeErrorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: THEME.errorSoft,
    borderRadius: RADIUS.md,
    padding: 12,
    marginTop: 8,
  },
  chargeErrorText: {
    flex: 1,
    color: THEME.error,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },

  // ── Fixed bottom actions ──
  actions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: THEME.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOW.raised,
  },
  btn: {
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  btnText: {
    color: THEME.onPrimary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: THEME.textSecondary,
    fontSize: 14.5,
    fontFamily: FONTS.semibold,
  },
});

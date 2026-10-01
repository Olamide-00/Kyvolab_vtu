import { StyleSheet, Platform } from "react-native";
import { FONTS, RADIUS, THEME } from "../../../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    marginTop: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  // ── Payment summary ───────────────────────────
  summary: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primarySoft,
  },
  summaryChipText: {
    flexShrink: 1,
    fontSize: 12.5,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },

  // ── PIN boxes ─────────────────────────────────
  prompt: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
  boxRow: {
    flexDirection: "row",
    gap: 12,
  },
  box: {
    width: 58,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderWidth: 1.5,
    borderColor: THEME.primary,
  },
  boxFilled: {
    borderColor: THEME.primaryMuted,
  },
  boxError: {
    borderStyle: "dashed",
    borderColor: THEME.textMuted,
  },
  boxDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.primary,
  },
  boxDotError: {
    backgroundColor: THEME.textMuted,
  },

  // ── Below the boxes ───────────────────────────
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primaryDeep,
  },
  errorText: {
    fontSize: 12.5,
    fontFamily: FONTS.semibold,
    color: THEME.onPrimary,
  },
  forgot: {
    marginTop: 18,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
    textDecorationLine: "underline",
  },

  // ── Processing overlay ────────────────────────
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(247,247,247,0.94)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
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
  loadingLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  loadingHint: {
    marginTop: 6,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },

  // ── Keypad ────────────────────────────────────
  // In the layout flow (pushed to the bottom) rather than absolutely
  // positioned, so it can never overlap the summary on short screens
  keypadContainer: {
    marginTop: "auto",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 24,
  },
});

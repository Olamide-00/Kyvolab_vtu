// style.ts
import { StyleSheet, Platform } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants/Colors";

// Success palette — rich emerald green
const S = {
  bg: "#1C1C1C", // deep forest green
  bgMid: "#1C1C1C",
  accent: "#9B9B9B", // vivid green
  accentSoft: "#7F7F7F",
  ring1: "rgba(155,155,155,0.15)",
  ring2: "rgba(155,155,155,0.08)",
  pill: "rgba(155,155,155,0.15)",
  pillBorder: "rgba(155,155,155,0.3)",
  blob: "rgba(155,155,155,0.07)",
};

// Failed palette — deep crimson
const F = {
  bg: "#111111", // deep dark red
  bgMid: "#191919",
  accent: "#686868",
  accentSoft: "#4D4D4D",
  ring1: "rgba(104,104,104,0.15)",
  ring2: "rgba(104,104,104,0.08)",
  pill: "rgba(104,104,104,0.12)",
  pillBorder: "rgba(104,104,104,0.3)",
  blob: "rgba(104,104,104,0.07)",
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: S.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("8%"),
    overflow: "hidden",
  },
  rootFailed: {
    backgroundColor: F.bg,
  },

  // ── Decorative blobs ──────────────────────────
  blob: {
    position: "absolute",
    top: -hp("8%"),
    right: -wp("20%"),
    width: wp("70%"),
    height: wp("70%"),
    borderRadius: wp("35%"),
    backgroundColor: S.blob,
  },
  blobFailed: {
    backgroundColor: F.blob,
  },
  blobBottom: {
    position: "absolute",
    bottom: -hp("6%"),
    left: -wp("20%"),
    width: wp("60%"),
    height: wp("60%"),
    borderRadius: wp("30%"),
    backgroundColor: S.blob,
  },
  blobBottomFailed: {
    backgroundColor: F.blob,
  },

  // ── Icon ──────────────────────────────────────
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("4%"),
  },
  iconOuterRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: S.ring2,
    borderWidth: 1,
    borderColor: S.ring1,
  },
  iconOuterRingFailed: {
    backgroundColor: F.ring2,
    borderColor: F.ring1,
  },
  iconRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: S.ring1,
    borderWidth: 1.5,
    borderColor: "rgba(155,155,155,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconRingFailed: {
    backgroundColor: F.ring1,
    borderColor: "rgba(104,104,104,0.25)",
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: S.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: S.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconInnerFailed: {
    backgroundColor: F.accent,
    shadowColor: F.accent,
  },
  image: {
    width: 52,
    height: 52,
  },

  // ── Text ──────────────────────────────────────
  descContainer: {
    alignItems: "center",
    gap: 10,
    marginBottom: hp("2%"),
  },

  // ── Pill ──────────────────────────────────────
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    backgroundColor: S.pill,
    borderWidth: 1,
    borderColor: S.pillBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillFailed: {
    backgroundColor: F.pill,
    borderColor: F.pillBorder,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: S.accentSoft,
  },
  pillDotFailed: {
    backgroundColor: F.accentSoft,
  },

  // ── Buttons ───────────────────────────────────
  btnContainer: {
    width: "100%",
    marginTop: hp("6%"),
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#ffffff",
    borderWidth: 0,
    width: "100%",
    paddingVertical: hp("2.1%"),
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  btnPrimaryText: {
    color: S.accentSoft,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    width: "100%",
    paddingVertical: hp("2.1%"),
    borderRadius: 16,
  },
  btnGhostText: {
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
});

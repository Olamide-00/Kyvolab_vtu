import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: hp("3%"),
  },
  referCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  referIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  referIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  referIconEmoji: {
    fontSize: 28,
  },
  referTextContainer: {
    flex: 1,
  },
  referTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  referDescription: {
    fontSize: 13,
    color: "#727272",
    lineHeight: 18,
  },
  bold: {
    fontWeight: "600",
    color: "#000",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  codeBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderStyle: "dashed",
    flex: 1,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  copyText: {
    fontSize: 13,
    color: COLORS.brand,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: "#727272",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: "#A2A2A2",
  },
  earningSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  earningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  earningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  earningHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewAllText: {
    fontSize: 13,
    color: "#A2A2A2",
  },
  earningList: {
    marginTop: 12,
    gap: 12,
  },
  earningItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  earningIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  greenBg: {
    backgroundColor: "#F9F9F9",
  },
  blueBg: {
    backgroundColor: "#F5F5F5",
  },
  redBg: {
    backgroundColor: "#F5F5F5",
  },
  earningIcon: {
    // Icon styling handled by Ionicons
  },
  earningDetails: {
    flex: 1,
  },
  earningName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  earningDate: {
    fontSize: 12,
    color: "#A2A2A2",
  },
  shareButton: {
    backgroundColor: COLORS.brand,
    marginHorizontal: wp("4%"),
    marginTop: hp("3%"),
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.brand,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  image: {
    width: wp("100%"),
    height: hp("7%"),
  },
});

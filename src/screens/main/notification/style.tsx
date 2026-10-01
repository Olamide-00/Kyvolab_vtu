import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("6%"),
    paddingBottom: hp("2%"),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#282828",
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp("5%"),
    paddingBottom: hp("3%"),
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    padding: wp("4%"),
    marginBottom: hp("1.5%"),
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#282828",
    flex: 1,
  },
  newBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  notificationMessage: {
    fontSize: 13,
    color: "#727272",
    lineHeight: 18,
    marginBottom: hp("1%"),
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp("0.5%"),
  },
  notificationTime: {
    fontSize: 12,
    color: "#A2A2A2",
  },
  viewLink: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.brand,
  },
});

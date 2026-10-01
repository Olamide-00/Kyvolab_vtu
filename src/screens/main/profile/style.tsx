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
    paddingBottom: hp("5%"),
  },
  profileHeader: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E7E7E7",
    marginRight: 12,
  },
  userInfo: {
    gap: 2,
  },
  accountNumber: {
    color: "#727272",
  },
  walletBalance: {
    color: "#727272",
  },
  viewProfileButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignSelf: "center",
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.brand,
  },
  menuContainer: {
    marginTop: 8,
  },
  logoutButton: {
    marginHorizontal: wp("4%"),
    marginVertical: hp("3%"),
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 15,
    color: "#686868",
    fontWeight: "500",
  },
});

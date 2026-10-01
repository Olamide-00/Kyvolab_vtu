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
  container: {
    flex: 1,
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
  },
  header: {
    marginBottom: hp("3%"),
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#282828",
    marginBottom: hp("1%"),
  },
  subtitle: {
    fontSize: 14,
    color: "#727272",
    lineHeight: 20,
  },
  optionsContainer: {
    gap: hp("2%"),
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 12,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#282828",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#727272",
    lineHeight: 18,
  },
});

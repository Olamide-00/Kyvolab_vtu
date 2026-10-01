import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: hp("6%"),
    paddingBottom: hp("3%"),
    paddingHorizontal: wp("5%"),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: -32,
  },
  placeholder: {
    width: 40,
  },
  chatBotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2%"),
    gap: 12,
  },
  chatBotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
  },
  chatBotTextContainer: {
    flex: 1,
  },
  chatBotGreeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  chatBotMessage: {
    fontSize: 13,
    color: "#ECECEC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp("5%"),
    paddingBottom: hp("3%"),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    paddingHorizontal: wp("4%"),
    marginBottom: hp("3%"),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    fontSize: 15,
    color: "#282828",
  },
  faqSection: {
    marginBottom: hp("3%"),
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#282828",
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.brand,
    fontWeight: "500",
  },
  faqList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    overflow: "hidden",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#282828",
  },
  faqAnswer: {
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("2%"),
    paddingLeft: wp("11%"),
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#727272",
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: hp("3%"),
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#282828",
    marginBottom: hp("1.5%"),
  },
  contactButtons: {
    flexDirection: "row",
    gap: wp("3%"),
  },
  contactButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#282828",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: wp("3%"),
  },
  communityButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#919191",
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  communityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#919191",
  },
  rateButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A6A6A6",
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A6A6A6",
  },
});

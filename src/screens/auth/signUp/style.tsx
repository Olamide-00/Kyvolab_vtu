import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: hp("2%"),
  },
  backButton: {
    paddingLeft: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("1%"),
  },
  content: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("8%"),
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: hp("3%"),
  },
  emoji: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: hp("1%"),
  },
  titleIconContainer: {
    alignSelf: "center",
    marginBottom: hp("2%"),
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: hp("4%"),
    paddingHorizontal: wp("5%"),
  },
  emailText: {
    color: "#333",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: hp("2.5%"),
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    lineHeight: 16,
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: hp("3%"),
  },
  privacyLink: {
    color: COLORS.brand,
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: COLORS.brand,
    borderWidth: 0,
    paddingVertical: hp("2%"),
    borderRadius: 12,
    marginTop: hp("15%"),
  },
  continueButton2: {
    backgroundColor: COLORS.brand,
    borderWidth: 0,
    paddingVertical: hp("2%"),
    borderRadius: 12,
    marginVertical: hp("2%"),
  },
  signInText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: hp("2%"),
  },
  signInLink: {
    color: COLORS.brand,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("3%"),
    marginBottom: hp("2%"),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: wp("3%"),
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  socialTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: hp("2%"),
  },
  socialButtons: {
    flexDirection: "row",
    gap: wp("4%"),
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  // OTP Styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp("3%"),
    marginVertical: hp("4%"),
    marginHorizontal: wp("10%"),
  },
  otpInput: {
    width: 35,
    height: 50,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("4%"),
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.brand,
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: COLORS.brand,
    borderWidth: 0,
    paddingVertical: hp("2%"),
    borderRadius: 12,
    marginTop: hp("30%"),
  },
  // Password Styles
  requirementsContainer: {
    marginTop: hp("1.5%"),
    gap: hp("1%"),
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#999",
  },
  requirementMet: {
    color: COLORS.brand,
  },
  // Details Styles
  formContainer: {
    gap: hp("1.5%"),
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
  },
  countryCode: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateInputText: {
    fontSize: 14,
    color: "#999",
  },
  // PIN Styles
  pinSection: {
    marginBottom: hp("3%"),
  },
  pinLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: hp("1.5%"),
    fontWeight: "500",
    textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp("3%"),
  },
  pinInput: {
    width: 35,
    height: 50,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EAEAEA",
    padding: wp("4%"),
    borderRadius: 12,
    alignItems: "center",
    gap: wp("3%"),
    marginBottom: hp("3%"),
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  image: {
    width: wp("30%"),
    height: hp("5%"),
    // marginBottom: hp("3%"),
    // marginTop: hp("2%"),
  },
  // Add these to your existing styles
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBEB",
    padding: wp("3%"),
    borderRadius: 8,
    marginBottom: hp("2%"),
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#8A8A8A",
    lineHeight: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Add these to your existing styles
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: hp("7%"),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  phoneInputDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#E0E0E0",
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
  },
  dateInputTextSelected: {
    color: "#333",
    fontWeight: "500",
  },
  datePickerDoneButton: {
    backgroundColor: COLORS.brand,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 10,
  },
  datePickerDoneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp("3%"),
  },
});

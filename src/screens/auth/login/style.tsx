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
  },
  content: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("8%"),
    paddingBottom: hp("3%"),
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
    marginBottom: hp("0.5%"),
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: hp("4%"),
  },
  formContainer: {
    marginBottom: hp("2%"),
  },
  inputContainer: {
    marginBottom: hp("3%"),
  },

  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  forgotPassword: {
    alignSelf: "flex-start",
    marginTop: hp("-1%"),
    marginBottom: hp("2%"),
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#8A8A8A",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: COLORS.brand,
    borderWidth: 0,
    paddingVertical: hp("2%"),
    borderRadius: 12,
    marginBottom: hp("2%"),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("2%"),
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
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  footer: {
    alignSelf: "center",
    flexDirection: "row",
    paddingLeft: wp("4.5%"),
  },
  signUpText: {
    fontSize: 14,
    color: "#333",
  },
  signUpLink: {
    color: COLORS.brand,
    fontWeight: "700",
  },
  image: {
    width: wp("100%"),
    height: hp("5%"),
    marginBottom: hp("4%"),
  },
});

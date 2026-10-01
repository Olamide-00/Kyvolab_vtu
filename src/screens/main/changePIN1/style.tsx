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
  formContainer: {
    gap: hp("2.5%"),
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#404040",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 8,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.8%"),
    fontSize: 15,
    color: "#282828",
    paddingRight: wp("12%"),
  },
  eyeIcon: {
    position: "absolute",
    right: wp("4%"),
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  buttonContainer: {
    position: "absolute",
    bottom: hp("3%"),
    left: wp("5%"),
    right: wp("5%"),
  },
  button: {
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
  TextStyle,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Stepper from "../component/stepper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVerifyOtp, useResendOtp } from "../../../../api/hooks/useAuth";
import Text from "../../../../components/common/txt";

const BRAND = "#111111";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 45; // seconds

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignUpOTP = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOTP, isPending: isResending } = useResendOtp();

  // ─── Resend cooldown ticker ────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ─── Keyboard visibility — hide footer while typing ───────
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const clearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const submitCode = (code: string) => {
    if (code.length < OTP_LENGTH || isVerifying) return;

    Keyboard.dismiss();
    setError("");

    verifyOTP(
      { email, otp: code },
      {
        onSuccess: () => {
          navigation.navigate("SignUpPassword", { email });
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message || "Invalid code. Please try again.";
          setError(message);
          clearOtp();
        },
      },
    );
  };

  const handleOtpChange = (value: string, index: number) => {
    if (error) setError("");

    // Paste support: full (or partial multi-char) code dropped into a box
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      const newOtp = Array(OTP_LENGTH).fill("");
      digits
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((d, i) => (newOtp[i] = d));
      setOtp(newOtp);

      const nextEmpty = newOtp.findIndex((d) => d === "");
      if (nextEmpty === -1) {
        inputRefs.current[OTP_LENGTH - 1]?.blur();
        submitCode(newOtp.join(""));
      } else {
        inputRefs.current[nextEmpty]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);

    if (digits && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when the last digit lands
    if (digits && index === OTP_LENGTH - 1) {
      const code = newOtp.join("");
      if (code.length === OTP_LENGTH) submitCode(code);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;

    setError("");
    resendOTP(
      { email },
      {
        onSuccess: () => {
          setCooldown(RESEND_COOLDOWN);
          clearOtp();
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            "Failed to resend the code. Please try again.";
          setError(message);
        },
      },
    );
  };

  const otpCode = otp.join("");
  const isComplete = otpCode.length === OTP_LENGTH;
  const isFormDisabled = !isComplete || isVerifying;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isVerifying}
          hitSlop={8}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={INK} />
        </TouchableOpacity>
      </View>

      <Stepper currentStep={1} totalSteps={4} showLabel />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {/* TOP CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title}>Check your{"\n"}email</Text>
          <Text style={styles.subtitle}>
            We sent a {OTP_LENGTH}-digit code to{" "}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isVerifying}
            hitSlop={8}
            style={styles.changeEmail}
          >
            <Text style={styles.changeEmailText}>Change email</Text>
          </TouchableOpacity>

          {/* OTP BOXES */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused,
                  !!digit && styles.otpInputFilled,
                  !!error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1} // first box accepts a full paste
                selectTextOnFocus
                editable={!isVerifying}
                textContentType={index === 0 ? "oneTimeCode" : "none"}
                autoComplete={index === 0 ? "sms-otp" : "off"}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* RESEND */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't get the code? </Text>
            {cooldown > 0 ? (
              <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                hitSlop={8}
              >
                <Text
                  style={
                    // flatten to TextStyle to satisfy TS (StyleProp<TextStyle> expects TextStyle | TextStyle[])
                    // StyleSheet.flatten returns TextStyle | undefined
                    StyleSheet.flatten([
                      styles.resendLink,
                      isResending ? { opacity: 0.5 } : undefined,
                    ]) as TextStyle
                  }
                >
                  {isResending ? "Sending..." : "Resend it"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* BOTTOM — pinned CTA */}
        <View
          style={[
            styles.bottom,
            {
              paddingBottom: keyboardVisible
                ? 12
                : Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => submitCode(otpCode)}
            disabled={isFormDisabled}
            style={[
              styles.verifyButton,
              isFormDisabled && styles.verifyButtonDisabled,
            ]}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpOTP;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    color: INK,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 37,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
  },
  emailText: {
    color: INK,
    fontWeight: "700",
  },
  changeEmail: {
    alignSelf: "flex-start",
    marginTop: 6,
    marginBottom: 32,
  },
  changeEmailText: {
    color: BRAND,
    fontSize: 14,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: INK,
  },
  otpInputFocused: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  otpInputFilled: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  otpInputError: {
    borderColor: ERROR_RED,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 13,
    marginTop: 12,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    color: MUTED,
    fontSize: 14,
  },
  resendCooldown: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "700",
  },
  resendLink: {
    color: BRAND,
    fontSize: 14,
    fontWeight: "700",
  },
  bottom: {
    paddingHorizontal: 24,
  },
  verifyButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.35,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
  },
});

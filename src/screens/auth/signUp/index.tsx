import {
  View,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import Stepper from "./component/stepper";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSendRegistrationOTP } from "../../../api/hooks/useAuth";
import Text from "../../../components/common/txt";

const BRAND = "#111111";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignUp = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const { mutate: sendOTP, isPending } = useSendRegistrationOTP();

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

  const cleanEmail = email.trim().toLowerCase();
  const isValidEmail = EMAIL_REGEX.test(cleanEmail);
  const isFormDisabled = !isValidEmail || isPending;

  const handleContinue = () => {
    // navigation.navigate("SignUpOTP", { email: cleanEmail });
    if (isFormDisabled) return;

    Keyboard.dismiss();
    setError("");

    sendOTP(
      { email: cleanEmail },
      {
        onSuccess: () => {
          navigation.navigate("SignUpOTP", { email: cleanEmail });
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            "Failed to send OTP. Please try again.";
          setError(message);
        },
      }
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isPending}
          hitSlop={8}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={INK} />
        </TouchableOpacity>

        <Image
          source={require("../../../../assets/images/DEPAYLOGO.png")}
          resizeMode="contain"
          style={styles.logo}
        />

        {/* spacer to keep logo centered */}
        <View style={styles.backButton} />
      </View>

      <Stepper currentStep={0} totalSteps={4} showLabel />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {/* TOP CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title}>What's your{"\n"}email address?</Text>
          <Text style={styles.subtitle}>
            We'll send you a one-time code to keep your account secure.
          </Text>

          <View
            style={[
              styles.inputWrapper,
              focused && styles.inputWrapperFocused,
              !!error && styles.inputWrapperError,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={focused ? BRAND : MUTED}
            />
            <TextInput
              placeholder="name@email.com"
              placeholderTextColor="#ADADAD"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isPending}
              returnKeyType="go"
              onSubmitEditing={handleContinue}
              style={styles.input}
            />
            {isValidEmail && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={BRAND}
              />
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
          {!keyboardVisible && (
            <Text style={styles.privacyText}>
              By continuing, you agree to our{" "}
              <Text
                style={styles.privacyLink}
                onPress={() => navigation.navigate("PrivacyPolicy")}
              >
                Privacy Policy
              </Text>{" "}
              and{" "}
              <Text
                style={styles.privacyLink}
                onPress={() => navigation.navigate("TermsOfUse")}
              >
                Terms of Use
              </Text>
              .
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={isFormDisabled}
            style={[
              styles.continueButton,
              isFormDisabled && styles.continueButtonDisabled,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {!keyboardVisible && (
            <View style={styles.footer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable
                onPress={() => navigation.navigate("Login")}
                disabled={isPending}
                hitSlop={8}
              >
                <Text style={styles.signInLink}>Log in</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 76,
    alignSelf: "center",
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
    marginBottom: 36,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: ERROR_RED,
  },
  input: {
    flex: 1,
    color: INK,
    fontSize: 16,
    height: "100%",
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 13,
    marginTop: 8,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  privacyText: {
    color: MUTED,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 14,
  },
  privacyLink: {
    color: BRAND,
    fontWeight: "700",
  },
  continueButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  signInText: {
    color: MUTED,
    fontSize: 14.5,
  },
  signInLink: {
    color: BRAND,
    fontSize: 14.5,
    fontWeight: "700",
  },
});

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
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import Stepper from "./stepper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../../../../components/common/txt";

const BRAND = "#111111";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FieldName = "password" | "confirm" | null;

const SignUpPassword = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { email } = route.params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldName>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // ─── Keyboard visibility ───────────────────────────────────
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

  // ─── Live validation ───────────────────────────────────────
  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { text: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const showMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canContinue = allRequirementsMet && passwordsMatch;

  const handleContinue = () => {
    if (!canContinue) return;

    Keyboard.dismiss();
    // Pass email + password forward to final step
    navigation.navigate("SignUpDetails", { email, password });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={INK} />
        </TouchableOpacity>
      </View>

      <Stepper currentStep={2} totalSteps={4} showLabel />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {/* TOP CONTENT — scrollable in case of small screens */}
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>Create a{"\n"}password</Text>
          <Text style={styles.subtitle}>
            Make it strong — it protects your money.
          </Text>

          {/* PASSWORD */}
          <View
            style={[
              styles.inputWrapper,
              focusedField === "password" && styles.inputWrapperFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={focusedField === "password" ? BRAND : MUTED}
            />
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#ADADAD"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="next"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={MUTED}
              />
            </TouchableOpacity>
          </View>

          {/* REQUIREMENTS */}
          <View style={styles.requirementsContainer}>
            {passwordRequirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <MaterialCommunityIcons
                  name={req.met ? "check-circle" : "circle-outline"}
                  size={16}
                  color={req.met ? BRAND : "#BABABA"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    req.met && styles.requirementMet,
                  ]}
                >
                  {req.text}
                </Text>
              </View>
            ))}
          </View>

          {/* CONFIRM PASSWORD */}
          <View
            style={[
              styles.inputWrapper,
              focusedField === "confirm" && styles.inputWrapperFocused,
              showMismatch && styles.inputWrapperError,
            ]}
          >
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color={focusedField === "confirm" ? BRAND : MUTED}
            />
            <TextInput
              placeholder="Re-enter password"
              placeholderTextColor="#ADADAD"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="go"
              onSubmitEditing={handleContinue}
              style={styles.input}
            />
            {passwordsMatch && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={BRAND}
              />
            )}
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={MUTED}
              />
            </TouchableOpacity>
          </View>

          {showMismatch ? (
            <Text style={styles.errorText}>Passwords don't match yet</Text>
          ) : null}
        </ScrollView>

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
            onPress={handleContinue}
            disabled={!canContinue}
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpPassword;

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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
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
    marginBottom: 32,
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
  requirementsContainer: {
    marginTop: 14,
    marginBottom: 24,
    gap: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    color: MUTED,
    fontSize: 13.5,
  },
  requirementMet: {
    color: BRAND,
    fontWeight: "600",
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
});

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
import React, { useState, useRef, useEffect } from "react";
import Stepper from "./stepper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCompleteRegistration } from "../../../../api/hooks/useAuth";
import Text from "../../../../components/common/txt";

const BRAND = "#111111";
const BRAND_SOFT = "#F0F0F0";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

const PIN_LENGTH = 4;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignUpTransactionPin = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { email, password, fullName, phoneNumber, gender, dateOfBirth } =
    route.params;

  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [confirmPin, setConfirmPin] = useState<string[]>(
    Array(PIN_LENGTH).fill(""),
  );
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const pinInputRefs = useRef<Array<TextInput | null>>([]);
  const confirmPinInputRefs = useRef<Array<TextInput | null>>([]);
  const hasSubmittedRef = useRef(false);

  const { mutate: completeRegistration, isPending } = useCompleteRegistration();

  const pinCode = pin.join("");
  const confirmPinCode = confirmPin.join("");
  const isPinComplete = pinCode.length === PIN_LENGTH;
  const isConfirmComplete = confirmPinCode.length === PIN_LENGTH;
  const pinsMatch = isPinComplete && pinCode === confirmPinCode;

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

  const clearConfirm = () => {
    setConfirmPin(Array(PIN_LENGTH).fill(""));
    confirmPinInputRefs.current[0]?.focus();
  };

  const submitRegistration = (code: string) => {
    // Synchronous guard — see hasSubmittedRef comment above. Checking
    // isPending alone isn't enough here because of the render-timing gap.
    if (hasSubmittedRef.current || isPending) return;
    hasSubmittedRef.current = true;

    Keyboard.dismiss();
    setError("");

    completeRegistration(
      {
        email,
        password,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        transactionPIN: code,
      },
      {
        onSuccess: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            "Registration failed. Please try again.";
          setError(message);
          // Allow retry on genuine failure (bad network, validation
          // error, etc.) — only the accidental double-fire needed
          // blocking, not legitimate resubmission after a real error.
          hasSubmittedRef.current = false;
        },
      },
    );
  };

  const handlePinChange = (value: string, index: number, isConfirm = false) => {
    if (error) setError("");

    const digit = value.replace(/\D/g, "").slice(-1);
    const current = isConfirm ? [...confirmPin] : [...pin];
    current[index] = digit;

    if (isConfirm) {
      setConfirmPin(current);
      if (digit && index < PIN_LENGTH - 1) {
        confirmPinInputRefs.current[index + 1]?.focus();
      }
      // Auto-submit when confirm is complete and matches
      if (digit && index === PIN_LENGTH - 1) {
        const finalConfirm = current.join("");
        if (finalConfirm.length === PIN_LENGTH) {
          if (finalConfirm === pinCode) {
            submitRegistration(pinCode);
          } else {
            setError("PINs don't match. Try again.");
            setConfirmPin(Array(PIN_LENGTH).fill(""));
            confirmPinInputRefs.current[0]?.focus();
          }
        }
      }
    } else {
      setPin(current);
      if (digit && index < PIN_LENGTH - 1) {
        pinInputRefs.current[index + 1]?.focus();
      }
      // Jump to confirm section once PIN is complete
      if (digit && index === PIN_LENGTH - 1) {
        confirmPinInputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number, isConfirm = false) => {
    if (e.nativeEvent.key !== "Backspace") return;

    const current = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmPinInputRefs : pinInputRefs;

    if (!current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    // Backspace on empty first confirm box goes back to the PIN section
    if (isConfirm && !current[index] && index === 0) {
      pinInputRefs.current[PIN_LENGTH - 1]?.focus();
    }
  };

  const handleComplete = () => {
    if (!isPinComplete) {
      setError(`Please enter a ${PIN_LENGTH}-digit PIN`);
      return;
    }
    if (!isConfirmComplete) {
      setError("Please confirm your PIN");
      confirmPinInputRefs.current[0]?.focus();
      return;
    }
    if (!pinsMatch) {
      setError("PINs don't match. Try again.");
      clearConfirm();
      return;
    }
    submitRegistration(pinCode);
  };

  const renderPinRow = (
    values: string[],
    refs: React.MutableRefObject<Array<TextInput | null>>,
    isConfirm: boolean,
  ) => (
    <View style={styles.pinContainer}>
      {values.map((digit, index) => {
        const inputKey = `${isConfirm ? "confirm" : "pin"}-${index}`;
        const isFocused = focusedInput === inputKey;
        return (
          <TextInput
            key={inputKey}
            ref={(ref) => (refs.current[index] = ref)}
            style={[
              styles.pinInput,
              isFocused && styles.pinInputFocused,
              !!digit && styles.pinInputFilled,
              !!error && isConfirm && styles.pinInputError,
            ]}
            value={digit}
            onChangeText={(value) => handlePinChange(value, index, isConfirm)}
            onKeyPress={(e) => handleKeyPress(e, index, isConfirm)}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => setFocusedInput(null)}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
            selectTextOnFocus
            editable={!isPending}
          />
        );
      })}
    </View>
  );

  const isFormDisabled = !pinsMatch || isPending;

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
      </View>

      <Stepper currentStep={4} totalSteps={4} showLabel />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>Secure your{"\n"}transactions</Text>
          <Text style={styles.subtitle}>
            Create a {PIN_LENGTH}-digit PIN you'll use to authorize every
            transaction.
          </Text>

          {/* PIN */}
          <Text style={styles.pinLabel}>Enter PIN</Text>
          {renderPinRow(pin, pinInputRefs, false)}

          {/* CONFIRM PIN */}
          <Text style={[styles.pinLabel, styles.confirmLabel]}>
            Confirm PIN
          </Text>
          {renderPinRow(confirmPin, confirmPinInputRefs, true)}

          {pinsMatch && !error ? (
            <View style={styles.matchRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={BRAND}
              />
              <Text style={styles.matchText}>PINs match</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* INFO */}
          {!keyboardVisible && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={20}
                color={BRAND}
              />
              <Text style={styles.infoText}>
                Never share this PIN with anyone. You'll need it to approve
                payments and transfers.
              </Text>
            </View>
          )}
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
            onPress={handleComplete}
            disabled={isFormDisabled}
            style={[
              styles.completeButton,
              isFormDisabled && styles.completeButtonDisabled,
            ]}
          >
            {isPending ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.completeButtonText}>
                  Creating your account...
                </Text>
              </>
            ) : (
              <Text style={styles.completeButtonText}>
                Complete registration
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpTransactionPin;

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
    marginBottom: 28,
  },
  pinLabel: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  confirmLabel: {
    marginTop: 24,
  },
  pinContainer: {
    flexDirection: "row",
    gap: 12,
  },
  pinInput: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: INK,
  },
  pinInputFocused: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  pinInputFilled: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  pinInputError: {
    borderColor: ERROR_RED,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  matchText: {
    color: BRAND,
    fontSize: 13.5,
    fontWeight: "600",
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 13,
    marginTop: 14,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: BRAND_SOFT,
    borderRadius: 14,
    padding: 14,
    marginTop: 28,
  },
  infoText: {
    flex: 1,
    color: BRAND,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 14,
    backgroundColor: BRAND,
  },
  completeButtonDisabled: {
    opacity: 0.35,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
  },
});

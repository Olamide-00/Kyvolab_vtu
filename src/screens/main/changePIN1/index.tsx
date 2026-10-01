import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  InputAccessoryView,
  Animated,
} from "react-native";
import React, { useRef, useState } from "react";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND = "#111111";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

const PIN_LENGTH = 4;
const ACCESSORY_ID = "pinKeyboardAccessory";

// A single animated PIN box — pops with a spring when filled
const PinBox = ({
  value,
  isFocused,
  hasError,
  editable,
  onChangeText,
  onKeyPress,
  onFocus,
  onBlur,
  inputRef,
  returnKeyType,
  onSubmitEditing,
}: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  React.useEffect(() => {
    if (value && !prevValue.current) {
      // digit just entered — pop
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 60,
          bounciness: 0,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 8,
        }),
      ]).start();
    }
    prevValue.current = value;
  }, [value]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TextInput
        ref={inputRef}
        style={[
          styles.pinBox,
          isFocused && styles.pinBoxFocused,
          !!value && styles.pinBoxFilled,
          hasError && styles.pinBoxError,
        ]}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType="number-pad"
        maxLength={1}
        secureTextEntry
        selectTextOnFocus
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        inputAccessoryViewID={Platform.OS === "ios" ? ACCESSORY_ID : undefined}
      />
    </Animated.View>
  );
};

const ChangePIN1 = () => {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [confirmPin, setConfirmPin] = useState<string[]>(
    Array(PIN_LENGTH).fill("")
  );
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pinRefs = useRef<Array<TextInput | null>>([]);
  const confirmRefs = useRef<Array<TextInput | null>>([]);

  const pinCode = pin.join("");
  const confirmCode = confirmPin.join("");
  const isPinComplete = pinCode.length === PIN_LENGTH;
  const isConfirmComplete = confirmCode.length === PIN_LENGTH;
  const pinsMatch = isPinComplete && pinCode === confirmCode;

  const handleChange = (value: string, index: number, isConfirm: boolean) => {
    if (error) setError("");

    const digit = value.replace(/\D/g, "").slice(-1);
    const current = isConfirm ? [...confirmPin] : [...pin];
    current[index] = digit;

    if (isConfirm) {
      setConfirmPin(current);
      if (digit && index < PIN_LENGTH - 1) {
        confirmRefs.current[index + 1]?.focus();
      }
      if (digit && index === PIN_LENGTH - 1) {
        Keyboard.dismiss();
      }
    } else {
      setPin(current);
      if (digit && index < PIN_LENGTH - 1) {
        pinRefs.current[index + 1]?.focus();
      }
      if (digit && index === PIN_LENGTH - 1) {
        confirmRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number, isConfirm: boolean) => {
    if (e.nativeEvent.key !== "Backspace") return;
    const current = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmRefs : pinRefs;

    if (!current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (isConfirm && !current[index] && index === 0) {
      pinRefs.current[PIN_LENGTH - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!isPinComplete) {
      setError("Enter a 4-digit PIN");
      return;
    }
    if (!isConfirmComplete) {
      setError("Confirm your new PIN");
      confirmRefs.current[0]?.focus();
      return;
    }
    if (!pinsMatch) {
      setError("PINs don't match");
      setConfirmPin(Array(PIN_LENGTH).fill(""));
      confirmRefs.current[0]?.focus();
      return;
    }

    Keyboard.dismiss();
    setError("");
    setIsSubmitting(true);

    try {
      // ⏳ TODO: wire to your change-PIN mutation, e.g.:
      // await changeTransactionPin({ pin: pinCode });
      // navigation.navigate("ChangePIN2") or show success + goBack()
    } catch (err) {
      setError("Couldn't update your PIN. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPinRow = (
    values: string[],
    refs: React.MutableRefObject<Array<TextInput | null>>,
    isConfirm: boolean
  ) => (
    <View style={styles.pinRow}>
      {values.map((digit, index) => {
        const key = `${isConfirm ? "confirm" : "pin"}-${index}`;
        const isLast = index === PIN_LENGTH - 1;
        return (
          <PinBox
            key={key}
            inputRef={(ref: TextInput | null) => (refs.current[index] = ref)}
            value={digit}
            isFocused={focusedInput === key}
            hasError={!!error && isConfirm}
            editable={!isSubmitting}
            onChangeText={(v: string) => handleChange(v, index, isConfirm)}
            onKeyPress={(e: any) => handleKeyPress(e, index, isConfirm)}
            onFocus={() => setFocusedInput(key)}
            onBlur={() => setFocusedInput(null)}
            returnKeyType={
              Platform.OS === "android" && isConfirm && isLast ? "done" : "next"
            }
            onSubmitEditing={
              Platform.OS === "android" && isConfirm && isLast
                ? () => Keyboard.dismiss()
                : undefined
            }
          />
        );
      })}
    </View>
  );

  const canSubmit = isPinComplete && isConfirmComplete && !isSubmitting;

  return (
    <View style={styles.root}>
      <CommonHeader title="" back />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Change Transaction PIN</Text>
            <Text style={styles.subtitle}>
              Create a new PIN to secure your Depay account.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* NEW PIN */}
            <Text style={styles.label}>New PIN</Text>
            {renderPinRow(pin, pinRefs, false)}

            {/* CONFIRM PIN */}
            <Text style={[styles.label, styles.confirmLabel]}>Confirm PIN</Text>
            {renderPinRow(confirmPin, confirmRefs, true)}

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
          </View>

          <View
            style={[
              styles.buttonContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Updating..." : "Set New PIN"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* iOS keyboard "Done" bar */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={8}>
              <Text style={styles.accessoryDone}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
};

export default ChangePIN1;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 12, marginBottom: 32 },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: INK,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: MUTED,
    lineHeight: 20,
  },
  formContainer: { flex: 1 },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: INK,
    marginBottom: 12,
  },
  confirmLabel: { marginTop: 26 },
  pinRow: {
    flexDirection: "row",
    gap: 10,
  },
  pinBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  pinBoxFocused: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  pinBoxFilled: {
    borderColor: BRAND,
    backgroundColor: "#FFFFFF",
  },
  pinBoxError: {
    borderColor: ERROR_RED,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  matchText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BRAND,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: ERROR_RED,
    marginTop: 16,
  },
  buttonContainer: { paddingTop: 12 },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    fontSize: 15.5,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  accessoryBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F6F6F6",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  accessoryDone: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BRAND,
  },
});

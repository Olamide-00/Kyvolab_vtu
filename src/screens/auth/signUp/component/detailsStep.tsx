import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Stepper from "./stepper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import Text from "../../../../components/common/txt";
import { useValidateReferralCode } from "../../../../api/hooks/useReferral";

const BRAND = "#111111";
const BRAND_SOFT = "#F0F0F0";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const FIELD_BG = "#FBFBFB";
const ERROR_RED = "#515151";

const MIN_AGE = 13;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FieldName = "name" | "phone" | "referral" | null;
type ReferralStatus = "idle" | "checking" | "valid" | "invalid";

const REFERRAL_MIN_LENGTH = 6;

const GENDER_OPTIONS = [
  { label: "Male", value: "male", icon: "gender-male" as const },
  { label: "Female", value: "female", icon: "gender-female" as const },
  { label: "Other", value: "other", icon: "gender-male-female" as const },
];

// Precise age check (year subtraction alone is off by up to a year)
const getAge = (dob: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const SignUpDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { email, password } = route.params;

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [focusedField, setFocusedField] = useState<FieldName>(null);
  const [error, setError] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<ReferralStatus>("idle");
  const [referralMessage, setReferralMessage] = useState("");
  const latestReferralCode = useRef("");
  const { mutate: validateReferralCode } = useValidateReferralCode();

  useEffect(() => {
    const code = referralCode.trim().toUpperCase();
    latestReferralCode.current = code;

    if (code.length < REFERRAL_MIN_LENGTH) {
      setReferralStatus("idle");
      setReferralMessage("");
      return;
    }

    setReferralStatus("checking");
    setReferralMessage("");

    const timer = setTimeout(() => {
      validateReferralCode(code, {
        onSuccess: (result) => {
          if (latestReferralCode.current !== code) return;
          setReferralStatus("valid");
          setReferralMessage(
            result.referrerName
              ? `Referred by ${result.referrerName}`
              : "Code applied",
          );
        },
        onError: (err) => {
          if (latestReferralCode.current !== code) return;
          const status = err.response?.status;
          if (status === 400 || status === 404) {
            setReferralStatus("invalid");
            setReferralMessage(
              err.response?.data?.message || "This referral code isn't valid",
            );
          } else {
            setReferralStatus("idle");
            setReferralMessage("");
          }
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [referralCode]);

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

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (error) setError("");
    }
  };

  // ─── Date picker ───────────────────────────────────────────
  const openDatePicker = () => {
    Keyboard.dismiss();
    setTempDate(dateOfBirth ?? new Date(2000, 0, 1));
    setShowDatePicker(true);
  };

  // Android: native dialog fires once with set/dismissed
  const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
      if (error) setError("");
    }
  };

  // iOS: spinner inside our sheet updates tempDate; Done confirms
  const handleIosDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDate(selectedDate);
  };

  const confirmIosDate = () => {
    setDateOfBirth(tempDate);
    setShowDatePicker(false);
    if (error) setError("");
  };

  const isUnderage = dateOfBirth ? getAge(dateOfBirth) < MIN_AGE : false;

  const canContinue =
    fullName.trim().length > 0 &&
    phoneNumber.length === 10 &&
    !!dateOfBirth &&
    !isUnderage &&
    !!gender &&
    referralStatus !== "invalid" &&
    referralStatus !== "checking";

  const handleContinue = () => {
    if (!canContinue || !dateOfBirth) return;

    Keyboard.dismiss();
    setError("");

    navigation.navigate("SignUpTransactionPin", {
      email,
      password,
      fullName: fullName.trim(),
      phoneNumber,
      gender,
      dateOfBirth: dateOfBirth.toISOString().split("T")[0],
      referralCode:
        referralCode.trim().length >= REFERRAL_MIN_LENGTH
          ? referralCode.trim().toUpperCase()
          : undefined,
    });
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

      <Stepper currentStep={3} totalSteps={4} showLabel />

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
          <Text style={styles.title}>Tell us about{"\n"}yourself</Text>
          <Text style={styles.subtitle}>
            We use this to set up and verify your account.
          </Text>

          {/* FULL NAME */}
          <Text style={styles.label}>Full name</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "name" && styles.inputWrapperFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={focusedField === "name" ? BRAND : MUTED}
            />
            <TextInput
              placeholder="e.g. Olamide Oladele"
              placeholderTextColor="#ADADAD"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (error) setError("");
              }}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              style={styles.input}
            />
          </View>

          {/* PHONE */}
          <Text style={styles.label}>Phone number</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "phone" && styles.inputWrapperFocused,
            ]}
          >
            <Text style={styles.countryFlag}>🇳🇬</Text>
            <Text style={styles.countryCode}>+234</Text>
            <View style={styles.phoneDivider} />
            <TextInput
              placeholder="903 601 8013"
              placeholderTextColor="#ADADAD"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              maxLength={10}
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            {phoneNumber.length === 10 && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={BRAND}
              />
            )}
          </View>

          {/* DATE OF BIRTH */}
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openDatePicker}
            style={[
              styles.inputWrapper,
              isUnderage && styles.inputWrapperError,
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-outline"
              size={20}
              color={MUTED}
            />
            <Text
              style={[styles.valueText, !dateOfBirth && styles.placeholderText]}
            >
              {dateOfBirth
                ? formatDate(dateOfBirth)
                : "Select your date of birth"}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={MUTED}
            />
          </TouchableOpacity>
          {isUnderage ? (
            <Text style={styles.errorText}>
              You must be at least {MIN_AGE} years old to register.
            </Text>
          ) : null}

          {/* GENDER — chips */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => {
              const isActive = gender === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  onPress={() => {
                    setGender(option.value);
                    if (error) setError("");
                  }}
                  style={[
                    styles.genderChip,
                    isActive && styles.genderChipActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={18}
                    color={isActive ? BRAND : MUTED}
                  />
                  <Text
                    style={[
                      styles.genderChipText,
                      isActive && styles.genderChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* REFERRAL CODE */}
          <Text style={styles.label}>Referral code (optional)</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "referral" && styles.inputWrapperFocused,
              referralStatus === "invalid" && styles.inputWrapperError,
            ]}
          >
            <MaterialCommunityIcons
              name="gift-outline"
              size={20}
              color={focusedField === "referral" ? BRAND : MUTED}
            />
            <TextInput
              placeholder="Enter a friend's code"
              placeholderTextColor="#ADADAD"
              value={referralCode}
              onChangeText={(text) => {
                setReferralCode(text.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12));
                if (error) setError("");
              }}
              onFocus={() => setFocusedField("referral")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            {referralStatus === "checking" && (
              <ActivityIndicator size="small" color={MUTED} />
            )}
            {referralStatus === "valid" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={BRAND}
              />
            )}
          </View>
          {referralMessage ? (
            <Text
              style={[
                styles.referralHint,
                referralStatus === "invalid" && styles.referralHintInvalid,
              ]}
            >
              {referralMessage}
            </Text>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

      {/* ANDROID — native date dialog */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ?? new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={handleAndroidDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1924, 0, 1)}
        />
      )}

      {/* iOS — spinner in a bottom sheet */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Date of birth</Text>

            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleIosDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1924, 0, 1)}
              themeVariant="light" // force light appearance to match the white sheet
              textColor={INK} // spinner-only prop, explicit text color
              style={styles.iosPicker}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={confirmIosDate}
              style={styles.sheetDoneButton}
            >
              <Text style={styles.sheetDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default SignUpDetails;

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
    marginBottom: 10,
  },
  label: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 18,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  referralHint: {
    color: MUTED,
    fontSize: 13,
    marginTop: 8,
  },
  referralHintInvalid: {
    color: ERROR_RED,
  },
  valueText: {
    flex: 1,
    color: INK,
    fontSize: 16,
  },
  placeholderText: {
    color: "#ADADAD",
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    color: INK,
    fontSize: 16,
    fontWeight: "600",
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
  },
  genderChipActive: {
    borderColor: BRAND,
    backgroundColor: BRAND_SOFT,
  },
  genderChipText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "600",
  },
  genderChipTextActive: {
    color: BRAND,
    fontWeight: "700",
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginBottom: 14,
  },
  sheetTitle: {
    color: INK,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  iosPicker: {
    alignSelf: "center",
  },
  sheetDoneButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  sheetDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

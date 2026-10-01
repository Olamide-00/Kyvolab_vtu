import {
  View,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import Input from "../../../components/common/input";
import { COLORS } from "../../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import useAuthStore from "../../../store/userStore";
import { useLogin } from "../../../api/hooks/useAuth";
import Text from "../../../components/common/txt";

const BRAND = "#111111";
const INK = "#151515";
const MUTED = "#707070";
const BORDER = "#E7E7E7";
const ERROR_RED = "#515151";

type BiometricType = "face" | "fingerprint" | null;

export default function Login() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const { setIsAuthenticated, setAccountDetails } = useAuthStore();
  const { mutate: login, isPending } = useLogin();

  // ─── Detect biometric hardware + a stored session ─────────
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) return;

        // Biometric login only works if a previous session exists
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("userSnapshot");
        if (!storedToken || !storedUser) return;

        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("face");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricType("fingerprint");
        } else {
          setBiometricType("fingerprint"); // iris etc. — generic fallback
        }
        setBiometricAvailable(true);
      } catch {
        // If detection fails, simply don't offer biometrics
      }
    };

    checkBiometrics();
  }, []);

  // ─── Shared store update — called after login ─────────────
  const saveUserToStore = (token: string, user: any) => {
    useAuthStore.getState().login(token, {
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isWalletCreated: user.isWalletCreated,
      balance: user.balance,
      profilePicture: user.profilePicture,
      tag: user.tag,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      accountNumber: user.accountNumber,
      bankName: user.bankName,
    });
    useAuthStore.getState().setIsWalletCreated(user.isWalletCreated);
    setAccountDetails(user.accountDetails || []);
    setIsAuthenticated(true);
  };

  // ─── Validation ───────────────────────────────────────────
  const validate = () => {
    const newErrors = { email: "", password: "" };
    if (!email || !email.includes("@")) newErrors.email = "Enter a valid email";
    if (!password || password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  // ─── Email/password login ─────────────────────────────────
  const handleLogin = () => {
    // setIsAuthenticated(true);
    if (!validate()) return;

    login(
      { email: email.trim().toLowerCase(), password: password.trim() },
      {
        onSuccess: async (data) => {
          const now = new Date().toISOString();
          await SecureStore.setItemAsync("token", data.token);
          await SecureStore.setItemAsync("loginDate", now);
          await SecureStore.setItemAsync("isFreshLogin", "true");
          // Snapshot for biometric session restore on next visit
          await SecureStore.setItemAsync(
            "userSnapshot",
            JSON.stringify(data.user)
          );

          saveUserToStore(data.token, data.user);
        },
        onError: (err: any) => {
          const errorMessage =
            err?.response?.data?.message ||
            "An error occurred. Please try again.";
          Alert.alert("Login Failed", errorMessage);

          if (errorMessage.includes("Please verify your account first")) {
            setTimeout(() => {
              navigation.navigate("SignUpOTP", {
                email: email.trim().toLowerCase(),
              });
            }, 1500);
          }
        },
      }
    );
  };

  // ─── Biometric login (restores stored session) ────────────
  const handleBiometricLogin = async () => {
    if (biometricLoading || isPending) return;
    setIsAuthenticated(true);
    setBiometricLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Log in to Depay",
        cancelLabel: "Use password instead",
        disableDeviceFallback: false,
      });

      if (!result.success) {
        // User cancelled or failed — no alert needed, they can use password
        return;
      }

      const token = await SecureStore.getItemAsync("token");
      const userRaw = await SecureStore.getItemAsync("userSnapshot");

      if (!token || !userRaw) {
        Alert.alert(
          "Session Expired",
          "Please log in with your password to re-enable biometric login."
        );
        setBiometricAvailable(false);
        return;
      }

      const user = JSON.parse(userRaw);
      await SecureStore.setItemAsync("isFreshLogin", "false");
      saveUserToStore(token, user);
    } catch {
      Alert.alert(
        "Biometric Login Failed",
        "Something went wrong. Please log in with your password."
      );
    } finally {
      setBiometricLoading(false);
    }
  };

  const isLoading = isPending || biometricLoading;
  const isFormDisabled = !email || !password || isLoading;

  const biometricLabel =
    biometricType === "face"
      ? "Log in with Face ID"
      : "Log in with fingerprint";
  const biometricIcon =
    biometricType === "face" ? "face-recognition" : "fingerprint";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
        >
          <Image
            source={require("../../../../assets/images/DEPAYLOGO.png")}
            resizeMode="contain"
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to access your Depay account.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Olamide@email.com"
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text.trim().toLowerCase());
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                width="100%"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                width="100%"
                secureTextEntry={!showPassword}
                editable={!isLoading}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={MUTED}
                    />
                  </TouchableOpacity>
                }
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPassword}
              disabled={isLoading}
              hitSlop={8}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isFormDisabled}
              style={[
                styles.loginButton,
                isFormDisabled && styles.loginButtonDisabled,
              ]}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log in</Text>
              )}
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleBiometricLogin}
                disabled={isLoading}
                style={styles.biometricButton}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={BRAND} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={biometricIcon}
                      size={22}
                      color={BRAND}
                    />
                    <Text style={styles.biometricButtonText}>
                      {biometricLabel}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Pressable
              onPress={() => navigation.navigate("SignUp")}
              disabled={isLoading}
              hitSlop={8}
            >
              <Text style={styles.signUpLink}>Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 32,
    alignSelf: "center",
  },
  title: {
    color: INK,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 50,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 12.5,
    marginTop: 6,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: BRAND,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.45,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  biometricButton: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  biometricButtonText: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  signUpText: {
    color: MUTED,
    fontSize: 14.5,
  },
  signUpLink: {
    color: BRAND,
    fontSize: 14.5,
    fontWeight: "700",
  },
});

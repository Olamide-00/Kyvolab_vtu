import { View, Animated, Easing, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { styles } from "./style";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import CustomKeypad from "../../../components/keypad/customKeyPad";
import { THEME } from "../../../theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useVerifyPIN } from "../../../api/hooks/usePIN";
import { usePayBills } from "../../../api/hooks/useBills";
import useAuthStore from "../../../store/userStore";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

type RouteParams = {
  serviceID?: string;
  variation_code?: string;
  amount?: any;
  expectedTotal?: number;
  phone?: string;
  billersCode?: string;
  type?: string;
};

type Stage = "idle" | "verifying" | "processing" | "success";

const STAGE_LABEL: Record<Exclude<Stage, "idle">, string> = {
  verifying: "Verifying your PIN",
  processing: "Purchasing your service",
  success: "Payment successful",
};

const OTP = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    serviceID,
    variation_code,
    amount,
    expectedTotal,
    phone,
    billersCode,
    type,
  } = (route.params as RouteParams) || {};

  const userData = useAuthStore((state: any) => state.userData);
  const email = userData?.email;

  const [pin, setPin] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showRedDots, setShowRedDots] = useState(false);

  const maxPinLength = 4;
  const loading = stage !== "idle";

  const dotAnims = useRef(
    [...Array(maxPinLength)].map(() => new Animated.Value(1)),
  ).current;

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Crossfades the label whenever the stage text changes — this is
  // the only motion happening during the wait besides the spinner,
  // so "Verifying" doesn't just snap into "Purchasing".
  const labelAnim = useRef(new Animated.Value(1)).current;
  const [displayedStage, setDisplayedStage] = useState<Stage>("idle");

  const { mutate: verifyPin } = useVerifyPIN();
  const { mutate: payBill } = usePayBills();

  const animateDot = (index: number) => {
    Animated.sequence([
      Animated.spring(dotAnims[index], {
        toValue: 1.4,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(dotAnims[index], {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shakeDots = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showOverlay = () =>
    Animated.timing(overlayAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

  const hideOverlay = (after?: () => void) =>
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(after);

  // Fade the current label out, swap the text, fade it back in.
  const goToStage = (next: Stage) => {
    setStage(next);
    Animated.timing(labelAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedStage(next);
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (pin.length === maxPinLength) {
      setDisplayedStage("verifying");
      labelAnim.setValue(1);
      setStage("verifying");
      showOverlay();

      verifyPin(
        { email, pin },
        {
          onSuccess: () => {
            goToStage("processing");

            payBill(
              {
                serviceID,
                variation_code,
                amount,
                expectedTotal,
                phone,
                email,
                billersCode,
                type,
              },
              {
                onSuccess: (response: any) => {
                  const isSuccess =
                    response?.success === true &&
                    response?.data?.response_description?.includes(
                      "TRANSACTION SUCCESSFUL",
                    );

                  if (isSuccess) {
                    goToStage("success");
                    setTimeout(() => {
                      hideOverlay(() => setStage("idle"));
                      // Use the normalized `transaction` object (lowercase
                      // status, category, label, date — matches what the
                      // history screens render) instead of the raw VTPass
                      // `data` payload, which has no top-level `status`
                      // field and was making the receipt show "Pending"
                      // right after a successful payment. `|| response?.data`
                      // is just a safety fallback in case `transaction` is
                      // ever missing from the response.
                      navigation.navigate("Receipt", {
                        transaction: response?.transaction || response?.data,
                      });
                    }, 550);
                  } else {
                    hideOverlay(() => setStage("idle"));
                    setTimeout(() => {
                      navigation.navigate("Success", {
                        success: false,
                        message: "Transaction Failed",
                        subMessage:
                          "Your payment could not be processed. Please try again.",
                      });
                    }, 180);
                  }
                },
                onError: (error: any) => {
                  hideOverlay(() => setStage("idle"));

                  if (error?.response?.data?.code === "FEE_CHANGED") {
                    const freshQuote = error.response.data.quote;
                    setTimeout(() => {
                      navigation.navigate("Confirmation", {
                        serviceID,
                        variation_code,
                        amount: String(freshQuote?.amount ?? amount),
                        phone,
                        billersCode,
                        type,
                      });
                    }, 180);
                    return;
                  }

                  const message =
                    error?.response?.data?.message ||
                    "Payment failed. Please try again.";
                  setTimeout(() => {
                    navigation.navigate("Success", {
                      success: false,
                      message: "Transaction Failed",
                      subMessage: message,
                    });
                  }, 180);
                },
              },
            );
          },

          onError: () => {
            // Wrong PIN — stay on screen, never navigate away
            hideOverlay(() => setStage("idle"));
            shakeDots();
            setShowRedDots(true);
            setStatus("error");
            setErrorMsg("Incorrect PIN. Please try again.");
            setPin("");
          },
        },
      );
    } else if (pin.length > 0) {
      animateDot(pin.length - 1);
      if (status === "error") {
        setStatus("idle");
        setShowRedDots(false);
      }
    }
  }, [pin]);

  const handleKeyPress = (key: string) => {
    if (pin.length < maxPinLength && !loading) setPin((prev) => prev + key);
  };

  const handleDelete = () => {
    if (!loading) setPin((prev) => prev.slice(0, -1));
  };

  // What's being authorised — shown above the PIN so the user sees the
  // exact amount and recipient before confirming
  const payable = Number(expectedTotal ?? amount) || 0;
  const providerLabel = (serviceID || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const recipient = phone || billersCode;

  return (
    <View style={styles.root}>
      <CommonHeader title="Authorise payment" back />

      <View style={styles.container}>
        {/* ── Payment summary ── */}
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>You're paying</Text>
          <Text style={styles.summaryAmount} numberOfLines={1}>
            ₦
            {payable.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          {providerLabel ? (
            <View style={styles.summaryChip}>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={14}
                color={THEME.textSecondary}
              />
              <Text style={styles.summaryChipText} numberOfLines={1}>
                {providerLabel}
                {recipient ? ` · ${recipient}` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── PIN boxes ── */}
        <Text style={styles.prompt}>Enter your 4-digit PIN</Text>
        <Animated.View
          style={[styles.boxRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {[...Array(maxPinLength)].map((_, index) => {
            const filled = index < pin.length;
            const active = index === pin.length && !loading;
            return (
              <View
                key={index}
                style={[
                  styles.box,
                  active && styles.boxActive,
                  filled && styles.boxFilled,
                  showRedDots && styles.boxError,
                ]}
              >
                {filled || showRedDots ? (
                  <Animated.View
                    style={[
                      styles.boxDot,
                      showRedDots && styles.boxDotError,
                      { transform: [{ scale: dotAnims[index] }] },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </Animated.View>

        {status === "error" ? (
          <View style={styles.errorRow}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={14}
              color={THEME.onPrimary}
            />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <Text
            style={styles.forgot}
            onPress={() => navigation.navigate("ChangePIN1")}
          >
            Forgot PIN?
          </Text>
        )}
      </View>

      <View style={styles.keypadContainer}>
        <CustomKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSubmit={() => {}}
          showSubmit={false}
          showForgotPin={false}
          disabled={loading}
          vibrate
        />
      </View>

      {/* ── Processing overlay ── */}
      {loading && (
        <Animated.View
          style={[styles.loadingOverlay, { opacity: overlayAnim }]}
        >
          <View style={styles.loadingBadge}>
            {displayedStage === "success" ? (
              <Ionicons name="checkmark" size={30} color={THEME.onPrimary} />
            ) : (
              <ActivityIndicator size="small" color={THEME.onPrimary} />
            )}
          </View>

          <Animated.Text
            style={[
              styles.loadingLabel,
              {
                opacity: labelAnim,
                transform: [
                  {
                    translateY: labelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {displayedStage !== "idle" ? STAGE_LABEL[displayedStage] : ""}
          </Animated.Text>
          <Text style={styles.loadingHint}>Please don't close the app</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default OTP;

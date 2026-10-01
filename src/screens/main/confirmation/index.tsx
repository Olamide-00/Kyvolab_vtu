import {
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Easing,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { styles } from "./style";
import CommonHeader from "../../../components/ui/commonHeader";
import Item from "../../../components/common/item";
import Btn from "../../../components/common/btn";
import { COLORS } from "../../../constants/Colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../../components/common/txt";
import { useGetFeeQuote } from "../../../api/hooks/useBills";

type ConfirmationParams = {
  serviceID: string;
  variation_code?: string;
  amount: string;
  phone?: string;
  billersCode?: string;
  type?: string;
  plan?: { name?: string };
};

const Confirmation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    serviceID = "",
    variation_code,
    amount,
    phone,
    billersCode,
    type,
    plan,
  } = (route.params as ConfirmationParams) || {};

  // ── Entrance animation values ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(28)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(20)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  // ── Press feedback values ──
  const confirmScale = useRef(new Animated.Value(1)).current;
  const cancelOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.stagger(90, [
      // Icon: fade + scale + a tiny settle rotation for a "pop" feel
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(iconRotate, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Details card: fade + slide up
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(cardAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      // Actions: fade + slide up, arriving last
      Animated.parallel([
        Animated.timing(btnFade, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(btnAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const iconSpin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-12deg", "0deg"],
  });

  const handlePressIn = () => {
    Animated.spring(confirmScale, {
      toValue: 0.96,
      speed: 50,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(confirmScale, {
      toValue: 1,
      speed: 30,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelPressIn = () => {
    Animated.timing(cancelOpacity, {
      toValue: 0.5,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelPressOut = () => {
    Animated.timing(cancelOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const isData = serviceID.toLowerCase().includes("data");
  const isElectricity =
    variation_code === "prepaid" || variation_code === "postpaid";
  const isTV = ["dstv", "gotv", "startimes"].includes(serviceID);
  const isEducation = type === "education";

  const serviceTypeLabel = isEducation
    ? "Education"
    : isData
      ? "Data"
      : isElectricity
        ? "Electricity"
        : isTV
          ? "TV"
          : "Airtime";
  const numericAmount = parseFloat(amount) || 0;
  const formattedAmount = numericAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const providerLabel = serviceID
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const {
    quote,
    isLoading: feeLoading,
    isError: feeError,
    refetch: refetchFee,
  } = useGetFeeQuote(serviceID, numericAmount);

  const fee = quote?.fee ?? 0;
  const totalPayable = quote?.total ?? numericAmount;
  const formattedFee = fee.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedTotal = totalPayable.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleConfirm = () => {
    navigation.navigate("OTP", {
      serviceID,
      variation_code,
      amount: numericAmount,
      expectedTotal: totalPayable,
      phone,
      billersCode,
      type,
    });
  };

  return (
    <View style={styles.root}>
      <CommonHeader title="Confirm Transaction" back />

      <View style={styles.container}>
        {/* ── Scrollable content ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Icon + heading */}
          <Animated.View
            style={[
              styles.iconSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.View
              style={[styles.iconRing, { transform: [{ rotate: iconSpin }] }]}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={26}
                  color={COLORS.brand}
                />
              </View>
            </Animated.View>
            <Text style={styles.reviewText}>Review Transaction</Text>
            <Text style={styles.reviewSubtext}>
              Confirm details before proceeding
            </Text>
          </Animated.View>

          {/* Details card */}
          <Animated.View
            style={[
              styles.detailsCard,
              { opacity: cardFade, transform: [{ translateY: cardAnim }] },
            ]}
          >
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>TOTAL PAYABLE</Text>
              {feeLoading ? (
                <ActivityIndicator
                  color={COLORS.white}
                  style={styles.amountLoader}
                />
              ) : (
                <Text style={styles.amountValue}>₦{formattedTotal}</Text>
              )}
              <View style={styles.amountBadge}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={10}
                  color={COLORS.dashboard}
                />
                <Text style={styles.amountBadgeText}>Instant Processing</Text>
              </View>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>DETAILS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.itemContainer}>
              <Item label="Service Type" value={serviceTypeLabel} />
              <Item label="Bill Amount" value={`₦${formattedAmount}`} />
              <Item
                label="Service Charge"
                value={feeLoading ? "Checking..." : `₦${formattedFee}`}
              />
              <Item label="Provider" value={providerLabel} />

              {isData && plan?.name && (
                <Item label="Data Plan" value={plan.name} />
              )}
              {isData && variation_code && !plan?.name && (
                <Item label="Plan Code" value={variation_code} />
              )}
              {isTV && variation_code && (
                <Item label="Package" value={variation_code} />
              )}
              {isTV && billersCode && (
                <Item label="Smartcard No." value={billersCode} />
              )}
              {isElectricity && variation_code && (
                <Item
                  label="Meter Type"
                  value={
                    variation_code.charAt(0).toUpperCase() +
                    variation_code.slice(1)
                  }
                />
              )}
              {isElectricity && billersCode && (
                <Item label="Meter Number" value={billersCode} />
              )}
              {phone && <Item label="Phone Number" value={phone} />}
            </View>

            <View style={styles.noteCard}>
              <MaterialCommunityIcons
                name="information-outline"
                size={13}
                color={COLORS.brand}
              />
              <Text style={styles.noteText}>
                Once confirmed, this transaction cannot be reversed.
              </Text>
            </View>

            {feeError && (
              <TouchableOpacity
                style={styles.chargeErrorCard}
                onPress={() => refetchFee()}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={13}
                  color={COLORS.error}
                />
                <Text style={styles.chargeErrorText}>
                  Couldn't verify the service charge. Tap to retry.
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>

        {/* ── Buttons — fixed outside scroll, always visible ── */}
        <Animated.View
          style={[
            styles.actions,
            { opacity: btnFade, transform: [{ translateY: btnAnim }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: confirmScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Btn
                title="Confirm & Continue"
                style={styles.btn}
                textStyle={styles.btnText}
                onPress={handleConfirm}
                disabled={feeLoading || feeError}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: cancelOpacity }}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              onPressIn={handleCancelPressIn}
              onPressOut={handleCancelPressOut}
              activeOpacity={1}
            >
              <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
};

export default Confirmation;

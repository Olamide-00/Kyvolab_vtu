// Success.tsx
import { View, Image, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { styles } from "./style";
import Text from "../../../components/common/txt";
import Btn from "../../../components/common/btn";
import { COLORS } from "../../../constants/Colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Success = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    success = true,
    pending = false,
    transaction,
    message,
  } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 55,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const isSuccess = success === true;
  const isPending = pending === true;

  return (
    <View style={[styles.root, !isSuccess && styles.rootFailed]}>
      {/* Decorative top blob */}
      <View style={[styles.blob, !isSuccess && styles.blobFailed]} />

      {/* Icon */}
      <Animated.View
        style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}
      >
        <Animated.View
          style={[
            styles.iconOuterRing,
            !isSuccess && styles.iconOuterRingFailed,
            { opacity: ringAnim },
          ]}
        />
        <View style={[styles.iconRing, !isSuccess && styles.iconRingFailed]}>
          <View
            style={[styles.iconInner, !isSuccess && styles.iconInnerFailed]}
          >
            {isPending ? (
              <MaterialCommunityIcons
                name="clock-outline"
                size={52}
                color="#fff"
              />
            ) : isSuccess ? (
              <MaterialCommunityIcons name="check" size={52} color="#fff" />
            ) : (
              <MaterialCommunityIcons name="close" size={52} color="#fff" />
            )}
          </View>
        </View>
      </Animated.View>

      {/* Text block */}
      <Animated.View
        style={[
          styles.descContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text variant="bold" size="3xl" color="#fff" center>
          {isPending
            ? "Payment\nProcessing"
            : isSuccess
              ? "Payment\nSuccessful!"
              : "Payment\nFailed"}
        </Text>

        <Text variant="regular" size="sm" color="rgba(255,255,255,0.65)" center>
          {isPending
            ? message ||
              "We're confirming your payment with the provider.\nIf it doesn't go through, your wallet is refunded automatically."
            : isSuccess
              ? "Your transaction has been\nprocessed and confirmed."
              : "We couldn't complete your\npayment. Please try again."}
        </Text>

        {/* Status pill */}
        <View style={[styles.pill, !isSuccess && styles.pillFailed]}>
          <View style={[styles.pillDot, !isSuccess && styles.pillDotFailed]} />
          <Text
            size="xs"
            variant="semibold"
            color={isSuccess ? "#7F7F7F" : "#4D4D4D"}
          >
            {isPending
              ? "Awaiting Confirmation"
              : isSuccess
                ? "Transaction Confirmed"
                : "Transaction Declined"}
          </Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.btnContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {isPending ? (
          <>
            {transaction ? (
              <Btn
                title="View Receipt"
                style={styles.btnPrimary}
                textStyle={styles.btnPrimaryText}
                onPress={() => navigation.navigate("Receipt", { transaction })}
              />
            ) : null}
            <Btn
              title="Back to Home"
              style={transaction ? styles.btnGhost : styles.btnPrimary}
              textStyle={
                transaction ? styles.btnGhostText : styles.btnPrimaryText
              }
              onPress={() =>
                navigation.navigate("TabNav", { screen: "HomeTab" })
              }
            />
          </>
        ) : isSuccess ? (
          <Btn
            title="Back to Home"
            style={styles.btnPrimary}
            textStyle={styles.btnPrimaryText}
            onPress={() => navigation.navigate("TabNav", { screen: "HomeTab" })}
          />
        ) : (
          <>
            <Btn
              title="Try Again"
              style={styles.btnPrimary}
              textStyle={styles.btnPrimaryText}
              onPress={() => navigation.goBack()}
            />
            <Btn
              title="Go to Home"
              style={styles.btnGhost}
              textStyle={styles.btnGhostText}
              onPress={() =>
                navigation.navigate("TabNav", { screen: "HomeTab" })
              }
            />
          </>
        )}
      </Animated.View>

      {/* Decorative bottom blob */}
      <View
        style={[styles.blobBottom, !isSuccess && styles.blobBottomFailed]}
      />
    </View>
  );
};

export default Success;

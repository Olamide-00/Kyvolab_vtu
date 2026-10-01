import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../../constants/Colors";
import Text from "../../../../components/common/txt";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
}

const TRACK = "#EEEEEE";

const Segment: React.FC<{ state: "completed" | "active" | "upcoming" }> = ({
  state,
}) => {
  const widthRef = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const animateTo = (filled: boolean, animated: boolean) => {
    const target = filled ? 0 : -widthRef.current;
    if (!animated) {
      translateX.setValue(target);
      return;
    }
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      damping: 20,
      stiffness: 180,
      mass: 0.6,
    }).start();
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    // Set initial position without animation, then sweep if active
    if (state === "completed") {
      animateTo(true, false);
    } else if (state === "active") {
      translateX.setValue(-widthRef.current);
      animateTo(true, true);
    } else {
      animateTo(false, false);
    }
  };

  useEffect(() => {
    if (widthRef.current === 0) return;
    if (state === "completed" || state === "active") {
      animateTo(true, true);
    } else {
      animateTo(false, true);
    }
  }, [state]);

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <Animated.View style={[styles.fill, { transform: [{ translateX }] }]} />
    </View>
  );
};

const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  showLabel = false,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Segment
            key={index}
            state={
              index < currentStep
                ? "completed"
                : index === currentStep
                ? "active"
                : "upcoming"
            }
          />
        ))}
      </View>

      {showLabel && (
        <Text style={styles.label}>
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("0%"),
  },
  container: {
    flexDirection: "row",
    gap: wp("2%"),
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: TRACK,
    overflow: "hidden",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    backgroundColor: COLORS.brand,
  },
  label: {
    marginTop: hp("1%"),
    fontSize: 12.5,
    fontWeight: "600",
    color: "#707070",
  },
});

export default Stepper;

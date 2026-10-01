import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../../../components/common/txt";

const { width, height } = Dimensions.get("window");

const BRAND = "#111111";
const ACCENT = "#D0D0D0"; // bright lime accent that pops on dark imagery

const SEGMENT_WIDTH = 32;
const SEGMENT_GAP = 8;

const slides = [
  {
    id: 1,
    image: {
      uri: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    },
    eyebrow: "WELCOME TO DEPAY",
    title: "Every bill.\nOne app.",
    description:
      "Airtime, data, TV, electricity and exam pins — all handled from one secure place.",
  },
  {
    id: 2,
    image: {
      uri: "https://images.unsplash.com/photo-1631024723490-e50733b2d7eb?q=80&w=1444&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    eyebrow: "AIRTIME & DATA",
    title: "Topped up in\nseconds.",
    description:
      "Any network, instantly. Save your frequent numbers and never run dry at the worst moment.",
  },
  {
    id: 3,
    image: {
      uri: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&q=80",
    },
    eyebrow: "TV & ELECTRICITY",
    title: "Skip the queue.\nKeep the lights on.",
    description:
      "Renew subscriptions and pay electricity in a few taps. No agents. No waiting.",
  },
  {
    id: 4,
    image: {
      uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    },
    eyebrow: "EDUCATION PINS",
    title: "Exam pins,\ndelivered instantly.",
    description:
      "WAEC, NECO and JAMB pins sent to you the moment your payment clears.",
  },
];

const Onboarding = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listRef = useRef<Animated.FlatList<(typeof slides)[number]>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  const goToIndex = (index: number) => {
    listRef.current?.scrollToOffset({ offset: index * width, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      navigation.navigate("Login" as never);
    } else {
      goToIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => navigation.navigate("Login" as never);

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) setCurrentIndex(index);
  };

  // Active progress segment slides across the track (transform-only, native safe)
  const indicatorTranslate = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map((_, i) => i * (SEGMENT_WIDTH + SEGMENT_GAP)),
    extrapolate: "clamp",
  });

  const renderSlide = ({
    item,
    index,
  }: {
    item: (typeof slides)[number];
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });
    const titleTranslate = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, -40],
      extrapolate: "clamp",
    });
    const descTranslate = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, -60],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={{ opacity: textOpacity }}>
          <Animated.View
            style={{ transform: [{ translateX: titleTranslate }] }}
          >
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: descTranslate }] }}>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent />

      {/* FULL-BLEED CROSSFADING BACKGROUNDS */}
      {slides.map((slide, index) => {
        const opacity = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });
        const scale = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [1.15, 1, 1.15],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={slide.id}
            style={[StyleSheet.absoluteFillObject, { opacity }]}
            pointerEvents="none"
          >
            <Animated.Image
              source={slide.image}
              style={[
                StyleSheet.absoluteFillObject,
                { width, height, transform: [{ scale }] },
              ]}
              resizeMode="cover"
            />
          </Animated.View>
        );
      })}

      {/* DARK CINEMATIC GRADIENTS */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(12,12,12,0.55)", "rgba(12,12,12,0.96)"]}
        locations={[0, 0.45, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* HEADER */}
      <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>depay</Text>
        </View>
        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={12}
            style={styles.skipPill}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SWIPEABLE TEXT LAYER */}
      <Animated.FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* FOOTER */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        {/* SLIDING PROGRESS TRACK */}
        <View style={styles.progressTrack}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              hitSlop={10}
            >
              <View style={styles.segment} />
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              styles.segmentActive,
              { transform: [{ translateX: indicatorTranslate }] },
            ]}
            pointerEvents="none"
          />
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.stepBig}>
              {String(currentIndex + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.stepSmall}>
              of {String(slides.length).padStart(2, "0")}
            </Text>
          </View>

          {isLastSlide ? (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.9}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Get started</Text>
              <Text style={styles.getStartedArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.9}
              style={styles.circleButton}
            >
              <Text style={styles.circleArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.62,
  },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  skipPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    alignItems: "flex-end",
  },
  slide: {
    width,
    paddingHorizontal: 28,
    paddingBottom: height * 0.24,
    justifyContent: "flex-end",
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  eyebrowLine: {
    width: 28,
    height: 2,
    backgroundColor: ACCENT,
    borderRadius: 1,
  },
  eyebrow: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15.5,
    lineHeight: 24,
    maxWidth: width * 0.82,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  progressTrack: {
    flexDirection: "row",
    gap: SEGMENT_GAP,
    marginBottom: 22,
  },
  segment: {
    width: SEGMENT_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  segmentActive: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SEGMENT_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepBig: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
  },
  stepSmall: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "600",
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  circleArrow: {
    color: BRAND,
    fontSize: 24,
    fontWeight: "800",
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: ACCENT,
    paddingHorizontal: 26,
    height: 60,
    borderRadius: 30,
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  getStartedText: {
    color: BRAND,
    fontSize: 16,
    fontWeight: "800",
  },
  getStartedArrow: {
    color: BRAND,
    fontSize: 18,
    fontWeight: "800",
  },
});

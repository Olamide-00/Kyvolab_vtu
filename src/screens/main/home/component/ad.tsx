import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FONTS, RADIUS, THEME } from "../../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Home sections are inset 16px on each side
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_GAP = 10;

type PromoCard = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Card fill */
  bg: string;
  /** Text + icon color on that fill */
  fg: string;
  /** CTA button fill */
  ctaBg: string;
  ctaFg: string;
  screen?: string;
};

const PROMOS: PromoCard[] = [
  {
    id: "refer",
    eyebrow: "EARN REWARDS",
    title: "Invite friends, get rewarded",
    subtitle: "Earn a bonus for every friend who joins and transacts.",
    cta: "Refer now",
    icon: "gift-outline",
    bg: THEME.surface,
    fg: THEME.text,
    ctaBg: THEME.primary,
    ctaFg: THEME.onPrimary,
    screen: "Refer",
  },
  {
    id: "data",
    eyebrow: "SAVE MORE",
    title: "Cheaper data, every network",
    subtitle: "MTN, Airtel, Glo & 9mobile at the best rates.",
    cta: "Buy data",
    icon: "wifi",
    bg: THEME.primaryDeep,
    fg: THEME.onPrimary,
    ctaBg: THEME.surface,
    ctaFg: THEME.text,
    screen: "Airtime",
  },
  {
    id: "bills",
    eyebrow: "NEVER GO DARK",
    title: "Pay electricity in seconds",
    subtitle: "All DisCos supported. Token delivered instantly.",
    cta: "Pay a bill",
    icon: "lightning-bolt",
    bg: THEME.primary,
    fg: THEME.onPrimary,
    ctaBg: THEME.surface,
    ctaFg: THEME.primary,
    screen: "Electricity",
  },
];

const Ad = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<PromoCard>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isScrolling = useRef(false);
  const currentRef = useRef(0);

  const startAutoSlide = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (isScrolling.current) return;
      const next = (currentRef.current + 1) % PROMOS.length;
      flatListRef.current?.scrollToOffset({
        offset: next * CARD_WIDTH,
        animated: true,
      });
      currentRef.current = next;
      setCurrentIndex(next);
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const handleScrollBeginDrag = () => {
    isScrolling.current = true;
    stopAutoSlide();
  };

  const handleMomentumScrollEnd = (e: any) => {
    isScrolling.current = false;
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    currentRef.current = index;
    setCurrentIndex(index);
    setTimeout(startAutoSlide, 2000);
  };

  const handlePress = (promo: PromoCard) => {
    if (promo.screen) {
      navigation.navigate("StackNav", { screen: promo.screen });
    }
  };

  const renderItem = ({ item }: { item: PromoCard }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress(item)}
        style={[
          styles.card,
          { backgroundColor: item.bg },
          item.bg === THEME.surface && styles.cardBordered,
        ]}
      >
        <View style={[styles.iconCircle, { borderColor: item.fg }]}>
          <MaterialCommunityIcons name={item.icon} size={18} color={item.fg} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.eyebrow, { color: item.fg }]}>
            {item.eyebrow}
          </Text>
          <Text style={[styles.title, { color: item.fg }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[styles.subtitle, { color: item.fg }]}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>

          <View style={[styles.cta, { backgroundColor: item.ctaBg }]}>
            <Text style={[styles.ctaText, { color: item.ctaFg }]}>
              {item.cta}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={14}
              color={item.ctaFg}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={PROMOS}
        renderItem={renderItem}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {PROMOS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default Ad;

const styles = StyleSheet.create({
  itemContainer: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH - CARD_GAP,
    minHeight: 136,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    padding: 18,
  },
  cardBordered: {
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconCircle: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    opacity: 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    width: "78%",
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1.4,
    opacity: 0.7,
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    opacity: 0.75,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primarySoft,
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primary,
  },
});

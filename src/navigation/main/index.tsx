import React, { useRef, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "../../screens/main/home";
import ProfileScreen from "../../screens/main/profile";
import { View, StyleSheet, Animated, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Service from "../../screens/main/service";
import Transaction from "../../screens/main/transaction";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RADIUS, SHADOW, THEME } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

export type MainTabParamList = {
  HomeTab: undefined;
  Service: undefined;
  Transaction: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const SCREENS: Record<string, React.ComponentType<any>> = {
  HomeTab: Home,
  Service: Service,
  Transaction: Transaction,
  ProfileTab: ProfileScreen,
};

// Labels match each screen's title; icons swap outline → filled when active
const TABS: {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}[] = [
  { name: "HomeTab", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "Service", label: "Pay", icon: "grid-outline", iconActive: "grid" },
  {
    name: "Transaction",
    label: "History",
    icon: "receipt-outline",
    iconActive: "receipt",
  },
  {
    name: "ProfileTab",
    label: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
];

// Compact icon-only dock: sized to its buttons, centered at the bottom
const BUTTON = 48;
const GAP = 6;
const BAR_PADDING = 6;

// ─── One tab — icon only, with a press-shrink ────────────────────
const TabButton = ({
  focused,
  label,
  icon,
  iconActive,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: IconName;
  iconActive: IconName;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressTo = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: to < 1 ? 50 : 20,
      bounciness: to < 1 ? 0 : 8,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressTo(0.86)}
      onPressOut={() => pressTo(1)}
      hitSlop={4}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.button, { transform: [{ scale }] }]}>
        <Ionicons
          name={focused ? iconActive : icon}
          size={21}
          color={focused ? THEME.text : "rgba(255,255,255,0.6)"}
        />
      </Animated.View>
    </Pressable>
  );
};

// ─── Charcoal pill with a sliding white circle ───────────────────
const CustomTabBar = ({ state, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: state.index,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [state.index]);

  const last = Math.max(state.routes.length - 1, 1);
  const translateX = slide.interpolate({
    inputRange: [0, last],
    outputRange: [0, (BUTTON + GAP) * last],
  });

  // Float above the true bottom edge; larger insets (home indicator,
  // Android 3-button nav) push the bar up accordingly
  const bottomOffset =
    Math.max(insets.bottom, 14) + (Platform.OS === "android" ? 4 : 0);

  return (
    <View
      style={[styles.barWrapper, { paddingBottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, { transform: [{ translateX }] }]}
        />

        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              focused={focused}
              label={tab.label}
              icon={tab.icon}
              iconActive={tab.iconActive}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

export default function TabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name as any}
          component={SCREENS[t.name]}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAP,
    padding: BAR_PADDING,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
    ...SHADOW.raised,
  },
  indicator: {
    position: "absolute",
    top: BAR_PADDING,
    left: BAR_PADDING,
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    backgroundColor: THEME.surface,
  },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

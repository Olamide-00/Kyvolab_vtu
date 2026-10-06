import { View, ScrollView, RefreshControl, StatusBar } from "react-native";
import React, { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./style";
import Header from "../../../components/ui/header";
import Dashboard from "./component/dashboard";
import Performance from "./component/performance";
import QuickAction from "./component/quickAction";
import RecentTransaction from "./component/recentTransaction";
import { THEME } from "../../../theme";

export function Home() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.innerHeader}>
        <View style={styles.section}>
          <Header />
        </View>

        {/* Balance — the one dark surface on the page */}
        <View style={styles.balanceCard}>
          <Dashboard refreshTick={refreshTick} />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
      >
        {/* Merchant performance: earnings, referrals, sales */}
        <View style={styles.section}>
          <Performance refreshTick={refreshTick} />
        </View>

        <View style={styles.section}>
          <QuickAction />
        </View>

        <View style={styles.section}>
          <RecentTransaction />
        </View>
      </ScrollView>
    </View>
  );
}

export default Home;

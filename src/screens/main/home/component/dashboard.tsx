import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../../../components/common/txt";
import TopUpModal from "./topupModal";
import { io, Socket } from "socket.io-client";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import useAuthStore from "../../../../store/userStore";
import { useGetBalance } from "../../../../api/hooks/useAuth";
import { FONTS, RADIUS, THEME } from "../../../../theme";

const SOCKET_URL = "https://api.depay.com.ng/";
const POLL_INTERVAL_MS = 20000;

interface DashboardProps {
  refreshTick?: number;
}

// ─── Animated count-up for the balance ───────────────────────
const useCountUp = (target: number, duration = 800) => {
  const [display, setDisplay] = useState(target);
  const animRef = useRef(new Animated.Value(target)).current;
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      setDisplay(target);
      animRef.setValue(target);
      return;
    }

    const listener = animRef.addListener(({ value }) => setDisplay(value));
    Animated.timing(animRef, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // listener-driven, no styles animated
    }).start(() => {
      animRef.removeListener(listener);
      setDisplay(target);
    });

    return () => animRef.removeListener(listener);
  }, [target]);

  return display;
};

const Dashboard = ({ refreshTick = 0 }: DashboardProps) => {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const userData = useAuthStore((state) => state.userData);
  const email = userData?.email || "";

  const { balance, refetch, isLoading: balanceLoading } = useGetBalance(email);

  // ─── Socket: live balance updates ──────────────────────────
  useEffect(() => {
    if (!email) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => setIsSocketConnected(true));
    socket.on("connect_error", () => setIsSocketConnected(false));
    socket.on("disconnect", () => setIsSocketConnected(false));

    socket.emit("join", email);

    socket.on("balance_updated", (data) => {
      setCurrentBalance(data.newBalance);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("balance_updated");
      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [email]);

  // ─── HTTP polling fallback — only while the socket is down ──
  useEffect(() => {
    if (!email || isSocketConnected) {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      return;
    }

    pollTimer.current = setInterval(() => {
      refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [email, isSocketConnected, refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (refreshTick > 0) {
      setCurrentBalance(null);
      refetch();
    }
  }, [refreshTick]);

  const rawBalance = Number(currentBalance ?? balance?.data ?? 0);
  const animatedBalance = useCountUp(rawBalance);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const [whole, decimals] = formatCurrency(animatedBalance).split(".");

  const hidden = "••••••";

  return (
    <>
      <View style={styles.wrap}>
        {/* ── BALANCE ── */}
        <View style={styles.labelRow}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.liveDot,
                !isSocketConnected && styles.liveDotOffline,
              ]}
            />
            <Text style={styles.label}>
              {isSocketConnected ? "Live balance" : "Wallet balance"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setBalanceVisible(!balanceVisible)}
            activeOpacity={0.7}
            hitSlop={10}
            style={styles.eyeButton}
          >
            <Ionicons
              name={balanceVisible ? "eye-off-outline" : "eye-outline"}
              size={16}
              color={THEME.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.amountRow}>
          {balanceLoading && currentBalance === null ? (
            <ActivityIndicator size="small" color={THEME.text} />
          ) : balanceVisible ? (
            <>
              <Text style={styles.currency}>₦</Text>
              <Text style={styles.amountWhole}>{whole}</Text>
              <Text style={styles.amountDecimals}>.{decimals}</Text>
            </>
          ) : (
            <Text style={styles.amountWhole}>{hidden}</Text>
          )}
        </View>

        {/* ── ACTIONS ── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.action, styles.actionPrimary]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color={THEME.onPrimary} />
            <Text style={[styles.actionText, styles.actionTextPrimary]}>
              Add money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("StackNav", { screen: "Refer" })}
            activeOpacity={0.85}
          >
            <Ionicons name="gift-outline" size={17} color={THEME.text} />
            <Text style={styles.actionText}>Refer & earn</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TopUpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.text,
  },
  liveDotOffline: {
    backgroundColor: THEME.textMuted,
  },
  label: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.textSecondary,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 20,
    minHeight: 56,
  },
  currency: {
    fontSize: 24,
    lineHeight: 44,
    marginRight: 4,
    fontFamily: FONTS.bold,
    color: THEME.textSecondary,
  },
  amountWhole: {
    fontSize: 44,
    lineHeight: 54,
    letterSpacing: -1.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  amountDecimals: {
    fontSize: 22,
    lineHeight: 44,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: THEME.primaryMuted,
  },
  actionPrimary: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  actionText: {
    fontSize: 14.5,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  actionTextPrimary: {
    color: THEME.onPrimary,
  },
});

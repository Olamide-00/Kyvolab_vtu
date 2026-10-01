import { View, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import CommonHeader from "../../../components/ui/commonHeader";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../../components/common/txt";
import { FONTS, RADIUS, THEME } from "../../../theme";

const examBoards = [
  {
    id: "1",
    label: "JAMB",
    description: "UTME & Direct Entry registration PIN",
    screen: "Jamb",
    icon: "school-outline" as const,
  },
  {
    id: "2",
    label: "WAEC",
    description: "Result checker PIN, delivered instantly",
    screen: "Waec",
    icon: "document-text-outline" as const,
  },
];

const Education = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <CommonHeader title="Education" back />
      <View style={styles.container}>
        <Text style={styles.title}>Which exam?</Text>
        <Text style={styles.subtitle}>
          Buy a PIN and we'll send it to your phone.
        </Text>

        <View style={styles.list}>
          {examBoards.map((board, i) => (
            <TouchableOpacity
              key={board.id}
              style={[styles.row, i === 0 && styles.rowDark]}
              onPress={() => navigation.navigate(board.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.icon, i === 0 && styles.iconDark]}>
                <Ionicons
                  name={board.icon}
                  size={24}
                  color={i === 0 ? THEME.primary : THEME.onPrimary}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, i === 0 && styles.onDark]}>
                  {board.label}
                </Text>
                <Text
                  style={[styles.rowDesc, i === 0 && styles.onDarkMuted]}
                  numberOfLines={2}
                >
                  {board.description}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={i === 0 ? THEME.onPrimary : THEME.text}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Education;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    marginTop: 4,
  },
  list: {
    marginTop: 24,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    minHeight: 96,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  rowDark: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDark: {
    backgroundColor: THEME.surface,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: THEME.text,
    letterSpacing: -0.3,
  },
  rowDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  onDark: { color: THEME.onPrimary },
  onDarkMuted: { color: THEME.onPrimaryMuted },
});

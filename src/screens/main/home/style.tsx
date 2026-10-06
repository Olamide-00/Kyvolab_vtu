import { StyleSheet } from "react-native";
import { RADIUS, SPACE, THEME } from "../../../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    // clear the floating tab bar
    paddingBottom: 120,
  },
  innerHeader: {
    paddingTop: SPACE.xl,
    // marginBottom: -60,
  },
  balanceCard: {
    marginTop: SPACE.md,
    marginHorizontal: SPACE.lg,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderRadius: RADIUS.hero,
    backgroundColor: THEME.accent,
  },
  section: {
    marginTop: SPACE.xl,
    paddingHorizontal: SPACE.lg,
  },
});

import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../../../components/common/txt";
import { FONTS, THEME } from "../../../../theme";

interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  /** Short status shown on the right, e.g. "Linked" or "24" */
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  /** For destructive rows like logout */
  danger?: boolean;
  /** Hide the divider on the last row of a group */
  isLast?: boolean;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
  danger = false,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={[styles.iconContainer, danger && styles.iconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? THEME.onPrimary : THEME.text}
        />
      </View>

      <View style={[styles.body, !isLast && styles.withDivider]}>
        <View style={styles.textBlock}>
          <Text style={styles.menuText}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}

        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={THEME.primaryMuted}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: {
    backgroundColor: THEME.primaryDeep,
  },
  // Divider starts after the icon, iOS-settings style
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    paddingRight: 14,
  },
  withDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  menuText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: THEME.text,
  },
  subtitle: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
  value: {
    maxWidth: 120,
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },
});

export default ProfileMenuItem;

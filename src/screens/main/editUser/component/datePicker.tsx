import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Text from "../../../../components/common/txt";
import { THEME } from "../../../../theme";

const BRAND = THEME.primary;
const INK = THEME.text;
const MUTED = THEME.textMuted;
const BORDER = THEME.border;
const FIELD_BG = THEME.primaryTint;

interface DatePickerModalProps {
  label: string;
  value: string; // "DD/MM/YYYY"
  onDateChange: (date: string) => void;
  placeholder?: string;
}

const parseDate = (value: string): Date => {
  const [d, m, y] = value.split("/").map(Number);
  if (d && m && y) return new Date(y, m - 1, d);
  return new Date(2000, 0, 1);
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  label,
  value,
  onDateChange,
  placeholder = "Select date",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const currentDate = value ? parseDate(value) : new Date(2000, 0, 1);

  const openPicker = () => setShowPicker(true);

  const handleChange = (event: any, date?: Date) => {
    // Android fires this once with type "set" or "dismissed";
    // iOS spinner fires continuously while scrolling.
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && date) {
        onDateChange(formatDate(date));
      }
      return;
    }
    // iOS
    if (date) onDateChange(formatDate(date));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity style={styles.inputWrapper} onPress={openPicker}>
        <Text style={[styles.input, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={MUTED} />
      </TouchableOpacity>

      {/* iOS: compact picker only appears once triggered, positioned inline */}
      {Platform.OS === "ios" && showPicker && (
        <View style={styles.iosPickerRow}>
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="compact"
            onChange={handleChange}
            maximumDate={new Date()}
            themeVariant="light"
            accentColor={BRAND}
          />
          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Android: native dialog, mounted only while open */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: INK,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: FIELD_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
  },
  input: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: INK,
  },
  placeholder: {
    color: MUTED,
  },
  iosPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: FIELD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BRAND,
  },
});

export default DatePickerModal;

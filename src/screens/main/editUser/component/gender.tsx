import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActionSheetIOS,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Text from "../../../../components/common/txt";
import { THEME } from "../../../../theme";

const BRAND = THEME.primary;
const INK = THEME.text;
const MUTED = THEME.textMuted;
const BORDER = THEME.border;
const FIELD_BG = THEME.primaryTint;

interface GenderSelectorProps {
  label: string;
  value: string;
  onGenderChange: (gender: string) => void;
  placeholder?: string;
}

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

const GenderSelector: React.FC<GenderSelectorProps> = ({
  label,
  value,
  onGenderChange,
  placeholder = "Select gender",
}) => {
  const [androidPickerVisible, setAndroidPickerVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  const getDisplayValue = () =>
    genderOptions.find((o) => o.value === value)?.label ?? "";

  const openPicker = () => {
    if (Platform.OS === "ios") {
      // Native iOS action sheet — built into React Native core
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...genderOptions.map((o) => o.label), "Cancel"],
          cancelButtonIndex: genderOptions.length,
        },
        (index) => {
          if (index < genderOptions.length) {
            onGenderChange(genderOptions[index].value);
          }
        }
      );
    } else {
      setDraftValue(value);
      setAndroidPickerVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputWrapper} onPress={openPicker}>
        <Text style={[styles.input, !value && styles.placeholder]}>
          {getDisplayValue() || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={MUTED} />
      </TouchableOpacity>

      {/* Android — native Picker (Material spinner dialog) */}
      {Platform.OS === "android" && (
        <Modal
          visible={androidPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAndroidPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAndroidPickerVisible(false)}
          >
            <View style={styles.pickerSheet}>
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity
                    onPress={() => setAndroidPickerVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>Select Gender</Text>
                  <TouchableOpacity
                    onPress={() => {
                      onGenderChange(draftValue);
                      setAndroidPickerVisible(false);
                    }}
                  >
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={draftValue}
                  onValueChange={(v) => setDraftValue(v)}
                >
                  {genderOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    flex: 1,
  },
  placeholder: {
    color: MUTED,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  pickerTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: MUTED,
  },
  doneText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BRAND,
  },
});

export default GenderSelector;

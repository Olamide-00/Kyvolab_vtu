import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Text from "../../../../components/common/txt";
import { THEME } from "../../../../theme";

const INK = THEME.text;
const BORDER = THEME.border;
const FIELD_BG = THEME.primaryTint;

interface PhoneNumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "901 234 5678",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.countryCode}>
          <Text style={styles.flag}>🇳🇬</Text>
          <Text style={styles.codeText}>+234</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={THEME.textMuted}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          // Native autofill hints — lets iOS/Android suggest a saved
          // number from Contacts/keychain
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={10}
        />
      </View>
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
    backgroundColor: FIELD_BG,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  flag: { fontSize: 18 },
  codeText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: INK,
    paddingLeft: 12,
    height: "100%",
  },
});

export default PhoneNumberInput;

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "./txt";
import { FONTS, RADIUS, THEME } from "../../theme";

const BRAND = THEME.primary;
const LIGHT_GREEN = THEME.primarySoft;
const INK = THEME.text;
const MUTED = THEME.textMuted;
const BORDER = THEME.border;
const FIELD_BG = THEME.surface;

interface Option {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: string; // image URL
}

interface BottomSheetSelectorProps {
  icon?: keyof typeof Ionicons.glyphMap;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  sheetTitle?: string;
  variant?: "inline" | "field";
}

const BottomSheetSelector: React.FC<BottomSheetSelectorProps> = ({
  icon = "chevron-down",
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  sheetTitle = "Select Option",
  variant = "inline",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
  };

  return (
    <>
      {variant === "inline" ? (
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setIsVisible(true)}
          activeOpacity={0.7}
        >
          {/* Show selected network image or fallback icon */}
          {selectedOption?.image ? (
            <Image
              source={{ uri: selectedOption.image }}
              style={styles.inlineImage}
            />
          ) : (
            <Ionicons name={icon} size={16} color={BRAND} />
          )}
          <Text style={styles.selectorText}>{displayText}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={BRAND}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.fieldButton}
          onPress={() => setIsVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.fieldLeft}>
            {selectedOption?.image && (
              <Image
                source={{ uri: selectedOption.image }}
                style={styles.fieldImage}
              />
            )}
            <Text
              style={[
                styles.fieldText,
                !selectedOption && styles.fieldPlaceholder,
              ]}
              numberOfLines={1}
            >
              {displayText}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={MUTED} />
        </TouchableOpacity>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.bottomSheetHandle} />
              <View style={styles.bottomSheetContent}>
                <Text style={styles.bottomSheetTitle}>{sheetTitle}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionItem,
                          isSelected && styles.selectedOption,
                        ]}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        {/* Image takes priority over icon */}
                        {option.image ? (
                          <Image
                            source={{ uri: option.image }}
                            style={styles.optionImage}
                          />
                        ) : option.icon ? (
                          <View
                            style={[
                              styles.optionIconBox,
                              isSelected && styles.optionIconBoxActive,
                            ]}
                          >
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={isSelected ? BRAND : MUTED}
                            />
                          </View>
                        ) : null}

                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkCircle}>
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: LIGHT_GREEN,
  },
  selectorText: {
    fontSize: 14,
    color: BRAND,
    marginLeft: 6,
    fontFamily: FONTS.semibold,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  inlineImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  fieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: FIELD_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    height: 58,
  },
  fieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  fieldImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  fieldText: {
    fontSize: 15,
    color: INK,
    flexShrink: 1,
  },
  fieldPlaceholder: {
    color: MUTED,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: 34,
    maxHeight: "70%",
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: INK,
    marginBottom: 14,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: LIGHT_GREEN,
    borderColor: BRAND,
  },
  optionImage: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: 12,
  },
  optionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: THEME.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionIconBoxActive: {
    backgroundColor: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: 14.5,
    color: INK,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: BRAND,
    fontWeight: "700",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomSheetSelector;

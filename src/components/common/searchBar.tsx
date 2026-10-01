import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Filter, SearchNormal, CloseCircle } from "iconsax-react-native";
import { FONTS, RADIUS, SHADOW, THEME } from "../../theme";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onFilterPress,
  showFilter = true,
}: SearchBarProps) => {
  const [searchText, setSearchText] = useState("");

  const handleClear = () => {
    setSearchText("");
    onSearch?.("");
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchNormal size={19} color={THEME.primary} variant="Outline" />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={THEME.textMuted}
          value={searchText}
          onChangeText={handleTextChange}
          returnKeyType="search"
          clearButtonMode="never"
          allowFontScaling={false}
        />

        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <CloseCircle size={18} color={THEME.textMuted} variant="Bold" />
          </TouchableOpacity>
        )}
      </View>

      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filterButton}
          activeOpacity={0.8}
        >
          <Filter size={19} color={THEME.onPrimary} variant="Bold" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    ...SHADOW.card,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: THEME.text,
    padding: 0,
    includeFontPadding: false,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: THEME.primary,
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.card,
  },
});

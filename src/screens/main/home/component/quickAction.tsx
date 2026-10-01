import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import { serviceData } from "../../../../constants/serviceData";
import {
  Simcard1,
  Simcard,
  Mobile,
  Receipt21,
  AddCircle,
  Card,
  People,
  Electricity,
  Simcard2,
  Book1,
  Game,
} from "iconsax-react-native";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../../components/common/txt";
import { RADIUS, THEME } from "../../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN = 5;
// card sits 16px in from each edge with 12px inner padding
const CARD_INNER = SCREEN_WIDTH - 16 * 2 - 12 * 2;
const ITEM_WIDTH = CARD_INNER / COLUMN;
const ICON_SIZE = 22;

const getIconComponent = (icon: string) => {
  const p = { size: ICON_SIZE, color: THEME.primary, variant: "Bulk" as const };
  switch (icon) {
    case "Simcard1":
      return <Simcard1 {...p} />;
    case "Simcard":
      return <Simcard {...p} />;
    case "phone-landscape":
      return <Mobile {...p} />;
    case "Electricity":
      return <Electricity {...p} />;
    case "Receipt21":
      return <Receipt21 {...p} />;
    case "Book1":
      return <Book1 {...p} />;
    case "Game":
      return <Game {...p} />;
    case "Card":
      return <Card {...p} />;
    case "People":
      return <People {...p} />;
    case "Simcard2":
      return <Simcard2 {...p} />;
    default:
      return <AddCircle {...p} />;
  }
};

const QuickAction = () => {
  const navigation = useNavigation<any>();

  const handlePress = (item: any, index: number) => {
    if (index === serviceData.length - 1) {
      navigation.navigate("Service");
    } else {
      navigation.navigate("StackNav", { screen: item.screen });
    }
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handlePress(item, index)}
      activeOpacity={0.6}
    >
      <View style={styles.iconTile}>{getIconComponent(item.icon)}</View>
      <Text
        size="sm"
        color={THEME.textSecondary}
        variant="regular"
        style={styles.label}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text variant="bold" size="md" color={THEME.text}>
          Services
        </Text>
      </View>

      <FlatList
        data={serviceData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={COLUMN}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default QuickAction;

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 2,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  row: {
    justifyContent: "flex-start",
    marginBottom: 14,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: "center",
    gap: 6,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});

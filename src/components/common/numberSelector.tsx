import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContacts } from "../../utils/contactProvider";
import Text from "./txt";
import { THEME } from "../../theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CLOSE_THRESHOLD = 120; // px dragged down before it snaps closed
const CLOSE_VELOCITY = 0.8; // fling speed that closes regardless of distance

const BRAND = THEME.primary;
const LIGHT_GREEN = THEME.primarySoft;
const INK = THEME.text;
const MUTED = THEME.textMuted;
const BORDER = THEME.border;
const FIELD_BG = THEME.surface;
const PLACEHOLDER = THEME.textMuted;
const FAINT_ICON = THEME.primaryMuted;

interface PhoneInputWithContactProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  cleanPhone: string;
};

const PhoneInputWithContact: React.FC<PhoneInputWithContactProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Enter phone number",
}) => {
  const [isContactSheetVisible, setIsContactSheetVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { contacts, isLoading, hasPermission, requestContacts } = useContacts();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current; // drag offset on top of slideAnim
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(14)).current;

  // Combined translateY for the sheet = settle position + live drag
  const sheetTranslateY = Animated.add(slideAnim, dragY);

  const closeModal = useCallback(() => setIsContactSheetVisible(false), []);

  // ─── Drag-to-close ──────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 6 && gesture.dy > 0,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) dragY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > CLOSE_THRESHOLD || gesture.vy > CLOSE_VELOCITY) {
          // Let it fly off screen, then unmount
          Animated.timing(dragY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(() => closeModal());
        } else {
          // Snap back
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isContactSheetVisible) {
      setRendered(true);
      dragY.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 68,
        friction: 14,
      }).start();

      contentOpacity.setValue(0);
      contentTranslate.setValue(14);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 260,
          delay: 130,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslate, {
          toValue: 0,
          delay: 130,
          useNativeDriver: true,
          speed: 16,
          bounciness: 4,
        }),
      ]).start();
    } else if (rendered) {
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRendered(false);
        setSearchQuery("");
        slideAnim.setValue(SCREEN_HEIGHT);
        dragY.setValue(0);
      });
    }
  }, [isContactSheetVisible]);

  const openContactPicker = async () => {
    setIsContactSheetVisible(true);
    if (!hasPermission) {
      await requestContacts();
    }
  };

  const handleSelectContact = useCallback(
    (cleanPhone: string) => {
      onChangeText(cleanPhone);
      closeModal();
    },
    [onChangeText, closeModal]
  );

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c: Contact) =>
        c.name?.toLowerCase().includes(q) ||
        c.phoneNumber?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleSelectContact(item.cleanPhone)}
        activeOpacity={0.7}
      >
        <View style={styles.contactAvatar}>
          <Text variant="semibold" size="sm" color={BRAND}>
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={FAINT_ICON} />
      </TouchableOpacity>
    ),
    [handleSelectContact]
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  return (
    <>
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.inputWrapper}>
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={17} color={BRAND} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={PLACEHOLDER}
            value={value}
            onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
            keyboardType="phone-pad"
            maxLength={11}
          />
          <TouchableOpacity
            style={styles.contactButton}
            onPress={openContactPicker}
            hitSlop={8}
          >
            <Ionicons name="people-outline" size={19} color={BRAND} />
          </TouchableOpacity>
        </View>
      </View>

      {rendered && (
        <Modal
          visible={rendered}
          transparent
          animationType="none"
          onRequestClose={closeModal}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={closeModal}
            />
            <Animated.View
              style={[
                styles.bottomSheetContainer,
                { transform: [{ translateY: sheetTranslateY }] },
              ]}
            >
              {/* Drag handle area — this is what responds to the gesture */}
              <View {...panResponder.panHandlers} style={styles.dragArea}>
                <View style={styles.bottomSheetHandle} />
              </View>

              <Animated.View
                style={[
                  styles.contentFlex,
                  {
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslate }],
                  },
                ]}
              >
                <View {...panResponder.panHandlers} style={styles.sheetHeader}>
                  <Text style={styles.bottomSheetTitle}>Select Contact</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={8}>
                    <Ionicons name="close" size={22} color={MUTED} />
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomSheetContent}>
                  {hasPermission && contacts.length > 0 && (
                    <View style={styles.searchWrapper}>
                      <Ionicons name="search-outline" size={17} color={MUTED} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search contacts"
                        placeholderTextColor={PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setSearchQuery("")}
                          hitSlop={8}
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color={FAINT_ICON}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={BRAND} />
                      <Text style={styles.loadingText}>
                        Loading contacts...
                      </Text>
                    </View>
                  ) : !hasPermission ? (
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={26}
                          color={BRAND}
                        />
                      </View>
                      <Text style={styles.emptyTitle}>
                        Contacts access needed
                      </Text>
                      <Text style={styles.emptyText}>
                        Allow access to quickly pick a number from your
                        contacts.
                      </Text>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={requestContacts}
                      >
                        <Text style={styles.retryButtonText}>Grant Access</Text>
                      </TouchableOpacity>
                    </View>
                  ) : filteredContacts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons
                          name="people-outline"
                          size={26}
                          color={BRAND}
                        />
                      </View>
                      <Text style={styles.emptyTitle}>
                        {searchQuery ? "No matches" : "No contacts found"}
                      </Text>
                      {searchQuery ? (
                        <Text style={styles.emptyText}>
                          Try a different name or number.
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <FlatList
                      data={filteredContacts}
                      keyExtractor={keyExtractor}
                      renderItem={renderContact}
                      style={styles.list}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      initialNumToRender={14}
                      maxToRenderPerBatch={14}
                      windowSize={7}
                      removeClippedSubviews
                    />
                  )}
                </View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
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
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 8,
    height: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: INK,
  },
  contactButton: { padding: 8, marginLeft: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  overlayTouchable: { flex: 1 },
  bottomSheetContainer: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "82%",
    height: "82%", // fixed so FlatList can size itself
  },
  dragArea: {
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: "center",
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
  },
  contentFlex: { flex: 1 },
  bottomSheetContent: { flex: 1, paddingHorizontal: 16 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bottomSheetTitle: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: INK,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.primaryTint,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: INK,
    height: "100%",
  },
  list: { flex: 1 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: MUTED,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 4,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontFamily: "Poppins-SemiBold",
    color: INK,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: BRAND,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: 14.5,
    fontFamily: "Poppins-Medium",
    color: INK,
    marginBottom: 1,
  },
  contactPhone: {
    fontSize: 12.5,
    fontFamily: "Poppins-Regular",
    color: MUTED,
  },
});

export default PhoneInputWithContact;

import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../../components/common/txt";
import DatePickerModal from "./component/datePicker";
import GenderSelector from "./component/gender";
import PhoneNumberInput from "./component/phoneNumber";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../../store/userStore";
import { useUpdateProfile } from "../../../api/hooks/useAuth";
import CommonHeader from "../../../components/ui/commonHeader";
import { FONTS, RADIUS, THEME } from "../../../theme";

const EditUser = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const userData = useAuthStore((state) => state.userData);

  const [fullName, setFullName] = useState(userData?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(userData?.dateOfBirth || "");
  const [gender, setGender] = useState(userData?.gender || "");
  const [avatarUri, setAvatarUri] = useState(userData?.profilePicture || "");
  const [imageFailed, setImageFailed] = useState(false);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const initial = (fullName || userData?.name || "U").charAt(0).toUpperCase();
  const showImage = !!avatarUri && !imageFailed;

  const handleSave = () => {
    if (!userData?.email) return;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (gender) updateData.gender = gender;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (avatarUri && avatarUri !== userData?.profilePicture) {
      updateData.profilePicture = avatarUri;
    }

    updateProfile(
      { email: userData.email, data: updateData },
      {
        onSuccess: (response) => {
          useAuthStore.getState().setUserData({
            ...useAuthStore.getState().userData!,
            name: response.user?.name || fullName,
            phoneNumber: response.user?.phoneNumber || phoneNumber,
            gender: response.user?.gender || gender,
            dateOfBirth: response.user?.dateOfBirth || dateOfBirth,
            profilePicture: response.user?.profilePicture || avatarUri,
          });

          Alert.alert("Success", "Profile updated successfully");
          navigation.goBack();
        },
        onError: (err: any) => {
          Alert.alert(
            "Error",
            err?.response?.data?.message || "Failed to update profile",
          );
        },
      },
    );
  };

  const handleChangeImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setImageFailed(false);
      // ⏳ NOTE: this stores the local URI. If your backend expects a
      // hosted URL, upload to Cloudinary here first (see the bondmaker
      // profile-picture flow for the getSignature → uploadToCloudinary
      // pattern) and setAvatarUri(secure_url) instead.
    }
  };

  // Only enable Save once something actually changed
  const hasChanges =
    fullName !== (userData?.name || "") ||
    phoneNumber !== (userData?.phoneNumber || "") ||
    dateOfBirth !== (userData?.dateOfBirth || "") ||
    gender !== (userData?.gender || "") ||
    avatarUri !== (userData?.profilePicture || "");

  return (
    <View style={styles.root}>
      <CommonHeader title="Edit profile" back />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Photo ── */}
        <View style={styles.photo}>
          <TouchableOpacity onPress={handleChangeImage} activeOpacity={0.85}>
            {showImage ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color={THEME.onPrimary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangeImage}
            style={styles.photoButton}
            activeOpacity={0.8}
          >
            <Text style={styles.photoButtonText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* ── Basic info ── */}
        <Text style={styles.sectionTitle}>Basic info</Text>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor={THEME.textMuted}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
          </View>

          <PhoneNumberInput
            label="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="901 234 5678"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.inputLocked]}>
              <Text style={styles.lockedText} numberOfLines={1}>
                {userData?.email || "—"}
              </Text>
              <Ionicons name="lock-closed" size={14} color={THEME.textMuted} />
            </View>
          </View>
        </View>

        {/* ── About you ── */}
        <Text style={styles.sectionTitle}>About you</Text>
        <View style={styles.card}>
          <DatePickerModal
            label="Date of birth"
            value={dateOfBirth}
            onDateChange={setDateOfBirth}
            placeholder="01/01/2000"
          />

          <GenderSelector
            label="Gender"
            value={gender}
            onGenderChange={setGender}
            placeholder="Select gender"
          />
        </View>
      </ScrollView>

      {/* ── Save — pinned to the bottom ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isPending) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isPending}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {isPending ? "Saving…" : "Save changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditUser;

const AVATAR = 96;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ── Photo ─────────────────────────────────────
  photo: {
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avatarFallback: {
    backgroundColor: THEME.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    borderWidth: 3,
    borderColor: THEME.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  photoButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: THEME.text,
  },

  // ── Sections ──────────────────────────────────
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: THEME.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    padding: 16,
    paddingBottom: 0,
    borderRadius: RADIUS.xl,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    color: THEME.text,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.primaryTint,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: THEME.text,
  },
  inputLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.primarySoft,
  },
  lockedText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: THEME.textMuted,
  },

  // ── Footer ────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  saveButton: {
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.25,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: THEME.onPrimary,
  },
});

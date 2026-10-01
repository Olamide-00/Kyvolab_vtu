import { View, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "./style";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OTPVerify = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.root}>
      <CommonHeader title="" back />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text size="xl" style={styles.title}>
            OTP Verification
          </Text>
          <Text style={styles.subtitle}>
            Please select a verification method to verify your OTP
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Biometric Verification */}
          <TouchableOpacity style={styles.optionCard}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="finger-print-outline"
                  size={24}
                  color="#2B2B2B"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Biometric Verification</Text>
                <Text style={styles.optionSubtitle}>
                  Authenticate using your fingerprint
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A2A2A2" />
          </TouchableOpacity>

          {/* Email Verification */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() =>
              navigation.navigate("StackNav", { screen: "PasswordOTP" })
            }
          >
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={24} color="#2B2B2B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Email Verification</Text>
                <Text style={styles.optionSubtitle}>
                  OTP sent to your registered email
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A2A2A2" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OTPVerify;

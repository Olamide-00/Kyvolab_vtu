import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import Text from "../../../components/common/txt";
import CommonHeader from "../../../components/ui/commonHeader";
import { Ionicons } from "@expo/vector-icons";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);

  return (
    <View style={styles.root}>
      <CommonHeader title="" back />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text size="xl" style={styles.title}>
              Change Login Password
            </Text>
            <Text style={styles.subtitle}>
              Create a new password to secure your JARA account.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* New Login Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Login Password*</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter New Password"
                  placeholderTextColor="#A2A2A2"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#A2A2A2"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={hasMinLength ? "#919191" : "#A2A2A2"}
                  />
                  <Text
                    style={
                      hasMinLength
                        ? [styles.requirementText, styles.requirementMet]
                        : styles.requirementText
                    }
                  >
                    at least 8 characters
                  </Text>
                </View>

                <View style={styles.requirementItem}>
                  <Ionicons
                    name={hasNumber ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={hasNumber ? "#919191" : "#A2A2A2"}
                  />
                  <Text
                    style={
                      hasNumber
                        ? [styles.requirementText, styles.requirementMet]
                        : styles.requirementText
                    }
                  >
                    at least 1 number
                  </Text>
                </View>

                <View style={styles.requirementItem}>
                  <Ionicons
                    name={hasUppercase ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={hasUppercase ? "#919191" : "#A2A2A2"}
                  />
                  <Text
                    style={
                      hasUppercase
                        ? [styles.requirementText, styles.requirementMet]
                        : styles.requirementText
                    }
                  >
                    at least 1 uppercase letter
                  </Text>
                </View>

                <View style={styles.requirementItem}>
                  <Ionicons
                    name={hasLowercase ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={hasLowercase ? "#919191" : "#A2A2A2"}
                  />
                  <Text
                    style={
                      hasLowercase
                        ? [styles.requirementText, styles.requirementMet]
                        : styles.requirementText
                    }
                  >
                    at least 1 lowercase letter
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password*</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-Enter New Password"
                  placeholderTextColor="#A2A2A2"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#A2A2A2"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Set New Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPassword;

import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import CommonHeader from "../../../components/ui/commonHeader";
import { useNavigation } from "@react-navigation/native";
import Text from "../../../components/common/txt";

interface ComingSoonProps {
  serviceName?: string;
  title?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  serviceName = "Service",
  title,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <CommonHeader title={title || serviceName} back />

      <View style={styles.content}>
        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚀</Text>
        </View>

        {/* Coming Soon Text */}
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          {serviceName} service is currently under development and will be
          available soon.
        </Text>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            We're working hard to bring you this feature. Stay tuned for
            updates!
          </Text>
        </View>

        {/* Go Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#111111",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ComingSoon;

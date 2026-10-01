import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PhoneInputWithContact from "../../../components/common/numberSelector";
import { ContactsProvider } from "../../../utils/contactProvider";
import { useNavigation } from "@react-navigation/native";
import { useGetServicePLan } from "../../../api/hooks/useBills";
import Text from "../../../components/common/txt";
import {
  PayScreen,
  PlanPicker,
  Step,
  formatNaira,
} from "../../../components/pay";
import { FONTS, RADIUS, THEME } from "../../../theme";

const Waec = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useGetServicePLan("waec");

  const variations = data?.data?.content?.variations || [];
  const serviceID = data?.data?.content?.serviceID;

  const examTypeOptions = variations.map((item: any) => ({
    value: item.variation_code,
    title: item.name,
    subtitle: "per PIN",
    price: item.variation_amount,
  }));

  const [selectedExamType, setSelectedExamType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [quantityError, setQuantityError] = useState("");

  // Update total amount when exam type or quantity changes
  useEffect(() => {
    const selected = variations.find(
      (item: any) => item.variation_code === selectedExamType,
    );
    const unitAmount = parseFloat(selected?.variation_amount || "0");
    const qty = Math.max(parseInt(quantity || "0"), 0);
    setAmount(unitAmount * qty);
  }, [selectedExamType, quantity, variations]);

  // Quantity validation
  useEffect(() => {
    if (parseInt(quantity || "0") < 1) {
      setQuantityError("Quantity cannot be less than 1");
    } else {
      setQuantityError("");
    }
  }, [quantity]);

  const adjustQuantity = (delta: number) => {
    const current = Math.max(parseInt(quantity || "0"), 0);
    const next = Math.max(current + delta, 1);
    setQuantity(String(next));
  };

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID,
      variation_code: selectedExamType,
      amount: amount.toString(),
      phone,
      type: "education",
    });
  };

  const qty = parseInt(quantity || "0");
  const isQuantityValid = qty >= 1;
  const phoneValid = phone.length >= 10;
  const isFormValid = !!(selectedExamType && isQuantityValid && phoneValid);

  const unitPrice = selectedExamType && qty > 0 ? amount / qty : 0;

  return (
    <ContactsProvider>
      <PayScreen
        title="WAEC"
        subtitle="Result checker PIN"
        total={amount}
        totalLabel={qty > 1 && unitPrice ? `${qty} PINs` : "Total"}
        disabled={!isFormValid}
        onContinue={handleContinue}
      >
        <Step index={1} title="Exam type" done={!!selectedExamType}>
          <PlanPicker
            options={examTypeOptions}
            value={selectedExamType}
            onChange={setSelectedExamType}
            loading={isLoading}
            emptyText="No exam types available"
          />
        </Step>

        <Step
          index={2}
          title="How many PINs?"
          done={isQuantityValid}
          hint={unitPrice ? `${formatNaira(unitPrice)} each` : undefined}
        >
          <View
            style={[styles.stepper, quantityError && styles.stepperError]}
          >
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => adjustQuantity(-1)}
              disabled={qty <= 1}
              activeOpacity={0.7}
            >
              <Ionicons
                name="remove"
                size={20}
                color={qty <= 1 ? THEME.primaryMuted : THEME.text}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.stepperInput}
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={2}
            />

            <TouchableOpacity
              style={[styles.stepperButton, styles.stepperButtonDark]}
              onPress={() => adjustQuantity(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={THEME.onPrimary} />
            </TouchableOpacity>
          </View>
          {quantityError ? (
            <Text style={styles.error}>{quantityError}</Text>
          ) : null}
        </Step>

        <Step index={3} title="Phone number" done={phoneValid}>
          <PhoneInputWithContact
            value={phone}
            onChangeText={setPhone}
            placeholder="PINs will be sent here"
          />
        </Step>
      </PayScreen>
    </ContactsProvider>
  );
};

export default Waec;

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  stepperError: {
    borderStyle: "dashed",
    borderColor: THEME.textMuted,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonDark: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  stepperInput: {
    flex: 1,
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: THEME.text,
    padding: 0,
  },
  error: {
    marginTop: 8,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: THEME.textSecondary,
  },
});

import React, { useState, useEffect } from "react";
import PhoneInputWithContact from "../../../components/common/numberSelector";
import { ContactsProvider } from "../../../utils/contactProvider";
import { useNavigation } from "@react-navigation/native";
import { useGetServicePLan } from "../../../api/hooks/useBills";
import useVerify from "../../../api/hooks/useVerify";
import {
  AmountEntry,
  Field,
  FieldStatus,
  PayScreen,
  PlanPicker,
  Step,
} from "../../../components/pay";

const Jamb = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useGetServicePLan("jamb");

  const variations = data?.data?.content?.variations || [];
  const serviceID = data?.data?.content?.serviceID;

  const examTypeOptions = variations.map((item: any) => ({
    value: item.variation_code,
    title: item.name,
    price: item.variation_amount,
  }));

  const [selectedExamType, setSelectedExamType] = useState("");
  const [profileCode, setProfileCode] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [profileError, setProfileError] = useState("");

  // Update amount when exam type changes
  useEffect(() => {
    const selected = variations.find(
      (item: any) => item.variation_code === selectedExamType,
    );
    setAmount(parseFloat(selected?.variation_amount || "0"));
  }, [selectedExamType, variations]);

  // Profile code length validation
  useEffect(() => {
    if (profileCode && profileCode.length !== 10) {
      setProfileError("Profile code must be 10 digits");
    } else {
      setProfileError("");
    }
  }, [profileCode]);

  // Verify profile when 10 digits entered
  const { mutate: verify, isPending: isVerifying } = useVerify();

  useEffect(() => {
    if (serviceID && profileCode.length === 10) {
      setCustomerName("");
      verify(
        { serviceID, billersCode: profileCode },
        {
          onSuccess: (data: any) => {
            setCustomerName(
              data?.data?.content?.Customer_Name || "Invalid Profile",
            );
          },
          onError: () => setCustomerName(""),
        },
      );
    } else {
      setCustomerName("");
    }
  }, [serviceID, profileCode]);

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID,
      variation_code: selectedExamType,
      amount: amount.toString(),
      phone,
      billersCode: profileCode,
      type: "education",
    });
  };

  const profileStatus: FieldStatus = isVerifying
    ? "loading"
    : customerName
      ? "success"
      : profileError || profileCode.length === 10
        ? "error"
        : "idle";

  const profileMessage = profileError
    ? profileError
    : isVerifying
      ? "Checking profile…"
      : customerName
        ? customerName
        : profileCode.length === 10
          ? "We couldn't verify this profile code"
          : undefined;

  const phoneValid = phone.length >= 10;
  const isFormValid = !!(
    selectedExamType &&
    profileCode.length === 10 &&
    customerName &&
    phoneValid &&
    !isVerifying
  );

  return (
    <ContactsProvider>
      <PayScreen
        title="JAMB"
        subtitle="UTME / Direct Entry PIN"
        total={amount}
        buttonLabel={isVerifying ? "Verifying…" : "Continue"}
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

        <Step index={2} title="Profile code" done={!!customerName}>
          <Field
            icon="id-card-outline"
            value={profileCode}
            onChangeText={(text) => {
              setProfileCode(text.replace(/[^0-9]/g, ""));
              setCustomerName("");
            }}
            placeholder="10-digit profile code"
            keyboardType="number-pad"
            maxLength={10}
            status={profileStatus}
            message={profileMessage}
          />
        </Step>

        <Step index={3} title="Phone number" done={phoneValid}>
          <PhoneInputWithContact
            value={phone}
            onChangeText={setPhone}
            placeholder="PIN will be sent here"
          />
        </Step>

        <Step index={4} title="Amount" done={amount > 0}>
          <AmountEntry
            value={amount > 0 ? String(amount) : ""}
            locked
            caption="Set by the exam type"
          />
        </Step>
      </PayScreen>
    </ContactsProvider>
  );
};

export default Jamb;

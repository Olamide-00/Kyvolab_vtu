import React, { useState, useEffect } from "react";
import { ContactsProvider } from "../../../utils/contactProvider";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGetAllServices } from "../../../api/hooks/useBills";
import useVerify from "../../../api/hooks/useVerify";
import useAuthStore from "../../../store/userStore";
import {
  AmountEntry,
  Field,
  FieldStatus,
  PayScreen,
  ProviderOption,
  ProviderPicker,
  Segment,
  Step,
} from "../../../components/pay";

type MeterType = "prepaid" | "postpaid";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000];

const Electricity = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  // DisCo hint from the Services screen, e.g. "ikeja-electric"
  const preselectedBiller: string | undefined = route.params?.biller;

  const phone = useAuthStore((state) => state.userData?.phoneNumber);

  const { data: servicesData, isLoading: servicesLoading } =
    useGetAllServices("electricity-bill");

  const [paymentType, setPaymentType] = useState<MeterType>("prepaid");
  const [serviceProvider, setServiceProvider] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [providers, setProviders] = useState<ProviderOption[]>([]);

  // Build provider options from API
  useEffect(() => {
    if (servicesData?.data?.content) {
      const mapped = servicesData.data.content.map((item: any) => ({
        // "Ikeja Electric Payment - IKEDC" → "Ikeja Electric"
        label: String(item.name || "").split(" - ")[0].replace(/ Payment$/i, ""),
        value: item.serviceID,
        image: item.image,
      }));
      setProviders(mapped);

      if (preselectedBiller && !serviceProvider) {
        const match = mapped.find((p: any) => p.value === preselectedBiller);
        if (match) setServiceProvider(match.value);
      }
    }
  }, [servicesData]);

  // Meter verification
  const { mutate: verify, isPending: isVerifying } = useVerify();

  useEffect(() => {
    const meterLen = meterNumber.length;
    if (serviceProvider && (meterLen === 12 || meterLen === 13)) {
      setCustomerName("");
      verify(
        { serviceID: serviceProvider, billersCode: meterNumber },
        {
          onSuccess: (data: any) => {
            setCustomerName(data?.data?.content?.Customer_Name || "");
          },
          onError: () => {
            setCustomerName("");
          },
        },
      );
    } else {
      setCustomerName("");
    }
  }, [serviceProvider, meterNumber]);

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID: serviceProvider,
      billersCode: meterNumber,
      variation_code: paymentType,
      amount,
      phone,
      type: "electricity",
    });
  };

  const meterLen = meterNumber.length;
  const meterValid = meterLen === 12 || meterLen === 13;

  const meterStatus: FieldStatus = isVerifying
    ? "loading"
    : customerName
      ? "success"
      : meterValid
        ? "error"
        : "idle";

  const meterMessage = isVerifying
    ? "Checking meter…"
    : customerName
      ? customerName
      : meterValid
        ? "We couldn't verify this meter number"
        : !serviceProvider
          ? "Pick a provider first"
          : undefined;

  const isFormValid = !!(
    serviceProvider &&
    meterValid &&
    customerName &&
    amount &&
    !isVerifying
  );

  return (
    <ContactsProvider>
      <PayScreen
        title="Electricity"
        top={
          <Segment<MeterType>
            options={[
              { label: "Prepaid", value: "prepaid" },
              { label: "Postpaid", value: "postpaid" },
            ]}
            value={paymentType}
            onChange={setPaymentType}
          />
        }
        total={amount}
        disabled={!isFormValid}
        onContinue={handleContinue}
      >
        <Step
          index={1}
          title="Provider"
          done={!!serviceProvider}
          hint={providers.length ? "Scroll for more" : undefined}
        >
          <ProviderPicker
            options={providers}
            value={serviceProvider}
            onChange={(value) => {
              setServiceProvider(value);
              setCustomerName("");
            }}
            loading={servicesLoading}
          />
        </Step>

        <Step index={2} title="Meter number" done={!!customerName}>
          <Field
            icon="flash-outline"
            value={meterNumber}
            onChangeText={(text) => {
              setMeterNumber(text.replace(/[^0-9]/g, ""));
              setCustomerName("");
            }}
            placeholder="12 or 13 digits"
            keyboardType="number-pad"
            maxLength={13}
            status={meterStatus}
            message={meterMessage}
          />
        </Step>

        <Step index={3} title="Amount" done={!!amount}>
          <AmountEntry
            value={amount}
            onChange={setAmount}
            quick={QUICK_AMOUNTS}
            caption={`${paymentType === "prepaid" ? "Token" : "Bill"} value`}
          />
        </Step>
      </PayScreen>
    </ContactsProvider>
  );
};

export default Electricity;

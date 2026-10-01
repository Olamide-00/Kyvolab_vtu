import React, { useState, useEffect, useMemo } from "react";
import { ContactsProvider } from "../../../utils/contactProvider";
import { useNavigation } from "@react-navigation/native";
import {
  useGetAllServices,
  useGetServicePLan,
} from "../../../api/hooks/useBills";
import useVerify from "../../../api/hooks/useVerify";
import useAuthStore from "../../../store/userStore";
import {
  Field,
  FieldStatus,
  PayScreen,
  PlanOption,
  PlanPicker,
  ProviderOption,
  ProviderPicker,
  Step,
} from "../../../components/pay";

const TV = () => {
  const navigation = useNavigation<any>();

  const { data: servicesData, isLoading: servicesLoading } =
    useGetAllServices("tv-subscription");

  const [serviceProvider, setServiceProvider] = useState("");
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [providers, setProviders] = useState<ProviderOption[]>([]);

  const userData = useAuthStore((state: any) => state.userData);
  const phone = userData?.phoneNumber;

  // Build provider options from API
  useEffect(() => {
    if (servicesData?.data?.content) {
      const mapped = servicesData.data.content.map((item: any) => ({
        label: String(item.name || "").split(" ")[0],
        value: item.serviceID,
        image: item.image,
      }));
      setProviders(mapped);
    }
  }, [servicesData]);

  // Fetch packages when provider is selected
  const { data: packagesData, isLoading: packagesLoading } =
    useGetServicePLan(serviceProvider);

  const variations: any[] = packagesData?.data?.content?.variations || [];

  const packages: PlanOption[] = useMemo(
    () =>
      variations.map((pkg: any) => ({
        value: pkg.variation_code,
        title: pkg.name,
        price: pkg.variation_amount,
      })),
    [packagesData],
  );

  // Smartcard verification
  const { mutate: verify, isPending: isVerifying } = useVerify();

  useEffect(() => {
    if (serviceProvider && smartCardNumber.length === 10) {
      setCustomerName("");
      verify(
        { serviceID: serviceProvider, billersCode: smartCardNumber },
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
  }, [serviceProvider, smartCardNumber]);

  const handlePackageSelect = (value: string) => {
    setSelectedPackage(value);
    const selected = variations.find((p: any) => p.variation_code === value);
    setAmount(selected?.variation_amount || "");
  };

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID: serviceProvider,
      billersCode: smartCardNumber,
      variation_code: selectedPackage,
      amount,
      phone,
      type: "tv",
    });
  };

  const cardComplete = smartCardNumber.length === 10;

  const cardStatus: FieldStatus = isVerifying
    ? "loading"
    : customerName
      ? "success"
      : cardComplete
        ? "error"
        : "idle";

  const cardMessage = isVerifying
    ? "Checking smartcard…"
    : customerName
      ? customerName
      : cardComplete
        ? "We couldn't verify this smartcard"
        : !serviceProvider
          ? "Pick a provider first"
          : undefined;

  const disable =
    !serviceProvider ||
    !smartCardNumber ||
    !selectedPackage ||
    !customerName ||
    !phone ||
    isVerifying ||
    packages.length === 0;

  return (
    <ContactsProvider>
      <PayScreen
        title="Cable TV"
        total={amount}
        disabled={disable}
        onContinue={handleContinue}
      >
        <Step index={1} title="Provider" done={!!serviceProvider}>
          <ProviderPicker
            options={providers}
            value={serviceProvider}
            onChange={(value) => {
              setServiceProvider(value);
              setSelectedPackage("");
              setAmount("");
              setCustomerName("");
            }}
            loading={servicesLoading}
          />
        </Step>

        <Step index={2} title="Smartcard / IUC number" done={!!customerName}>
          <Field
            icon="card-outline"
            value={smartCardNumber}
            onChangeText={(text) => {
              setSmartCardNumber(text.replace(/[^0-9]/g, ""));
              setCustomerName("");
            }}
            placeholder="10 digits"
            keyboardType="number-pad"
            maxLength={10}
            status={cardStatus}
            message={cardMessage}
          />
        </Step>

        <Step
          index={3}
          title="Package"
          done={!!selectedPackage}
          hint={packages.length ? `${packages.length} options` : undefined}
        >
          <PlanPicker
            options={packages}
            value={selectedPackage}
            onChange={handlePackageSelect}
            loading={!!serviceProvider && packagesLoading}
            emptyText={
              serviceProvider
                ? "No packages available"
                : "Pick a provider to see packages"
            }
          />
        </Step>
      </PayScreen>
    </ContactsProvider>
  );
};

export default TV;

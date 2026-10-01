import React, { useState, useEffect } from "react";
import PhoneInputWithContact from "../../../../components/common/numberSelector";
import { useNavigation } from "@react-navigation/native";
import { useGetAllServices } from "../../../../api/hooks/useBills";
import {
  AmountEntry,
  PayScreen,
  ProviderOption,
  ProviderPicker,
  Step,
} from "../../../../components/pay";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

interface AirtimeTabProps {
  /** Airtime/Data toggle, rendered under the header */
  top?: React.ReactNode;
  /** Network hint from the Services screen, e.g. "mtn" */
  preselectedNetwork?: string;
}

const AirtimeTab = ({ top, preselectedNetwork }: AirtimeTabProps) => {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useGetAllServices("airtime");

  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [networks, setNetworks] = useState<ProviderOption[]>([]);

  useEffect(() => {
    if (data?.data?.content) {
      const mapped = data.data.content.map((item: any) => ({
        label: item.name ? item.name.split(" ")[0] : "Unknown",
        value: item.serviceID,
        image: item.image, // use actual logo from API
      }));
      setNetworks(mapped);

      // Auto-select from the Services screen hint (only if nothing chosen yet)
      if (preselectedNetwork && !selectedNetwork) {
        const hint = preselectedNetwork.toLowerCase();
        const match = mapped.find(
          (n: any) =>
            n.label.toLowerCase().includes(hint) ||
            String(n.value).toLowerCase().includes(hint),
        );
        if (match) setSelectedNetwork(match.value);
      }
    }
  }, [data, preselectedNetwork]);

  const selectedService = data?.data?.content?.find(
    (item: any) => item.serviceID === selectedNetwork,
  );

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID: selectedService?.serviceID,
      phone,
      amount,
    });
  };

  const phoneValid = phone.length >= 10;
  const disable = !selectedNetwork || !phoneValid || !amount;

  return (
    <PayScreen
      title="Airtime & Data"
      top={top}
      total={amount}
      disabled={disable}
      onContinue={handleContinue}
    >
      <Step index={1} title="Network" done={!!selectedNetwork}>
        <ProviderPicker
          options={networks}
          value={selectedNetwork}
          onChange={setSelectedNetwork}
          loading={isLoading}
        />
      </Step>

      <Step index={2} title="Phone number" done={phoneValid}>
        <PhoneInputWithContact
          value={phone}
          onChangeText={setPhone}
          placeholder="0801 234 5678"
        />
      </Step>

      <Step index={3} title="Amount" done={!!amount}>
        <AmountEntry
          value={amount}
          onChange={setAmount}
          quick={QUICK_AMOUNTS}
          caption="Enter an amount or pick one below"
        />
      </Step>
    </PayScreen>
  );
};

export default AirtimeTab;

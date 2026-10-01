import React, { useState, useEffect, useMemo } from "react";
import PhoneInputWithContact from "../../../../components/common/numberSelector";
import { useNavigation } from "@react-navigation/native";
import {
  useGetAllServices,
  useGetServicePLan,
} from "../../../../api/hooks/useBills";
import {
  PayScreen,
  PlanOption,
  PlanPicker,
  ProviderOption,
  ProviderPicker,
  Step,
} from "../../../../components/pay";

interface DataTabProps {
  /** Airtime/Data toggle, rendered under the header */
  top?: React.ReactNode;
  /** Network hint from the Services screen, e.g. "mtn" */
  preselectedNetwork?: string;
}

const DataTab = ({ top, preselectedNetwork }: DataTabProps) => {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useGetAllServices("data");

  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDataPlan, setSelectedDataPlan] = useState("");
  const [networks, setNetworks] = useState<ProviderOption[]>([]);

  // Build network options from API
  useEffect(() => {
    if (data?.data?.content) {
      const mapped = data.data.content.map((item: any) => ({
        label: item.name ? item.name.split(" ")[0] : "Unknown",
        value: item.serviceID,
        image: item.image,
      }));

      // Deduplicate by label
      const unique = mapped.filter(
        (provider: any, index: number, self: any[]) =>
          index === self.findIndex((p) => p.label === provider.label),
      );

      setNetworks(unique);

      // Auto-select from the Services screen hint (only if nothing chosen yet)
      if (preselectedNetwork && !selectedNetwork) {
        const hint = preselectedNetwork.toLowerCase();
        const match = unique.find(
          (n: any) =>
            n.label.toLowerCase().includes(hint) ||
            String(n.value).toLowerCase().includes(hint),
        );
        if (match) setSelectedNetwork(match.value);
      }
    }
  }, [data, preselectedNetwork]);

  // Fetch data plans for the selected network
  const { data: dataPackage, isLoading: dataPackageLoading } =
    useGetServicePLan(selectedNetwork);

  const variations: any[] = dataPackage?.data?.content?.variations || [];

  const planOptions: PlanOption[] = useMemo(
    () =>
      variations.map((plan: any) => ({
        value: plan.variation_code,
        title: plan.name,
        price: plan.variation_amount,
      })),
    [dataPackage],
  );

  // Find selected plan details for navigation
  const selectedPlanObject = variations.find(
    (plan: any) => plan.variation_code === selectedDataPlan,
  );

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      serviceID: selectedNetwork,
      phone,
      amount: selectedPlanObject?.variation_amount,
      variation_code: selectedPlanObject?.variation_code,
      plan: selectedPlanObject,
    });
  };

  const phoneValid = phone.length >= 10;
  const disable = !selectedNetwork || !phoneValid || !selectedDataPlan;

  return (
    <PayScreen
      title="Airtime & Data"
      top={top}
      totalLabel={selectedPlanObject ? "Plan price" : "Total"}
      total={selectedPlanObject?.variation_amount}
      disabled={disable}
      onContinue={handleContinue}
    >
      <Step index={1} title="Network" done={!!selectedNetwork}>
        <ProviderPicker
          options={networks}
          value={selectedNetwork}
          onChange={(value) => {
            setSelectedNetwork(value);
            setSelectedDataPlan(""); // reset plan on network change
          }}
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

      <Step
        index={3}
        title="Data plan"
        done={!!selectedDataPlan}
        hint={planOptions.length ? `${planOptions.length} plans` : undefined}
      >
        <PlanPicker
          options={planOptions}
          value={selectedDataPlan}
          onChange={setSelectedDataPlan}
          columns={2}
          loading={!!selectedNetwork && dataPackageLoading}
          emptyText={
            selectedNetwork
              ? "No plans available for this network"
              : "Pick a network to see its plans"
          }
        />
      </Step>
    </PayScreen>
  );
};

export default DataTab;

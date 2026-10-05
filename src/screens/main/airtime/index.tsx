import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import AirtimeTab from "./component/airtimeTab";
import DataTab from "./component/dataTab";
import { ContactsProvider } from "../../../utils/contactProvider";
import { Segment } from "../../../components/pay";

type Mode = "airtime" | "data";

const Airtime = () => {
  const route = useRoute<any>();
  const initialType: Mode =
    route.params?.serviceType === "data" ? "data" : "airtime";
  const preselectedNetwork: string | undefined = route.params?.network;

  const [activeTab, setActiveTab] = useState<Mode>(initialType);

  const toggle = (
    <Segment<Mode>
      options={[
        { label: "Airtime", value: "airtime" },
        { label: "Data", value: "data" },
      ]}
      value={activeTab}
      onChange={setActiveTab}
    />
  );

  return (
    <ContactsProvider>
      {activeTab === "airtime" ? (
        <AirtimeTab
          top={toggle}
          preselectedNetwork={
            initialType === "airtime" ? preselectedNetwork : undefined
          }
        />
      ) : (
        <DataTab
          top={toggle}
          preselectedNetwork={
            initialType === "data" ? preselectedNetwork : undefined
          }
        />
      )}
    </ContactsProvider>
  );
};

export default Airtime;

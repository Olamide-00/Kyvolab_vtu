export type TransactionItem = {
  _id?: string;
  label?: string;
  category?: string;
  amount: string | number;
  status: string;
  date?: string;
  transaction_date?: string;
  type?: "debit" | "credit" | string;
  phone?: string;
  phoneNumber?: string;
  [key: string]: any;
};

export const mergeHistories = (
  bills: TransactionItem[] = [],
  funding: TransactionItem[] = [],
): TransactionItem[] => {
  const merged = [...bills, ...funding];

  return merged.sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  });
};

export const getCategoryIcon = (category?: string): string => {
  const map: { [key: string]: string } = {
    airtime: "phone",
    data: "wifi",
    betting: "cards-spade",
    netflix: "netflix",
    electricity: "lightning-bolt",
    tv: "television",
    gotv: "television",
    dstv: "television",
    jamb: "school",
    waec: "school",
    education: "school",
    transfer: "bank-transfer",
    wallet: "wallet",
  };
  return map[(category || "").toLowerCase()] || "wallet";
};

export const getCategoryColor = (
  category?: string,
  brandColor = "#111111",
): string => {
  const map: { [key: string]: string } = {
    airtime: "#8A8A8A",
    data: "#B1B1B1",
    betting: "#D6D6D6",
    netflix: "#393939",
    electricity: "#D0D0D0",
    tv: "#2B2B2B",
    gotv: "#2B2B2B",
    dstv: "#A4A4A4",
    jamb: "#727272",
    waec: "#727272",
    education: "#727272",
    transfer: "#9B9B9B",
    wallet: brandColor,
  };
  return map[(category || "").toLowerCase()] || brandColor;
};

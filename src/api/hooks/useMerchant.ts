import { useQuery } from "@tanstack/react-query";

export type StatsPeriod = "today" | "week" | "month";

export interface MerchantStats {
  /** Commission available to withdraw right now, in naira */
  earnedBalance: number;
  /** Commission earned within the period, in naira */
  earnedInPeriod: number;
  /** All-time number of people referred */
  totalReferrals: number;
  /** Referrals that signed up within the period */
  referralsInPeriod: number;
}

// TODO(merchant-api): PLACEHOLDER figures so the dashboard can be reviewed.
// Replace the queryFn body with the real call once the endpoint exists, e.g.
//   const res = await axiosInstance.get<ApiResponse<MerchantStats>>(
//     `${API_ENDPOINTS.MERCHANT_STATS}/${email}`, { params: { period } });
//   return res.data.data;
const PLACEHOLDER: Record<StatsPeriod, MerchantStats> = {
  today: {
    earnedBalance: 12450,
    earnedInPeriod: 850,
    totalReferrals: 24,
    referralsInPeriod: 1,
  },
  week: {
    earnedBalance: 12450,
    earnedInPeriod: 4200,
    totalReferrals: 24,
    referralsInPeriod: 5,
  },
  month: {
    earnedBalance: 12450,
    earnedInPeriod: 12450,
    totalReferrals: 24,
    referralsInPeriod: 11,
  },
};

export const useMerchantStats = (email: string, period: StatsPeriod) => {
  return useQuery<MerchantStats, Error>({
    queryKey: ["merchant", "stats", email, period],
    queryFn: async () => PLACEHOLDER[period],
    enabled: !!email,
    refetchOnWindowFocus: false,
  });
};

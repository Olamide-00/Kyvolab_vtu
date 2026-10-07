import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export type StatsPeriod = "today" | "week" | "month";

export interface MerchantStats {
  earnedInPeriod: number;
  totalReferrals: number;
  referralsInPeriod: number;
}

interface PeriodValues {
  today: number;
  week: number;
  month: number;
}

interface MerchantStatsRaw {
  earned: PeriodValues;
  joined: PeriodValues;
  totalReferrals: number;
}

export const useMerchantStats = (email: string, period: StatsPeriod) => {
  return useQuery<MerchantStatsRaw, Error, MerchantStats>({
    queryKey: ["merchant", "stats", email],
    queryFn: async () => {
      const [earnings, stats] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.EARNINGS_SUMMARY),
        axiosInstance.get(API_ENDPOINTS.REFERRAL_STATS),
      ]);

      const earned = earnings.data?.data ?? {};
      const referral = stats.data?.data ?? {};

      return {
        earned: {
          today: earned.today ?? 0,
          week: earned.thisWeek ?? 0,
          month: earned.thisMonth ?? 0,
        },
        joined: {
          today: referral.newReferrals?.today ?? 0,
          week: referral.newReferrals?.thisWeek ?? 0,
          month: referral.newReferrals?.thisMonth ?? 0,
        },
        totalReferrals: referral.totalReferrals ?? 0,
      };
    },
    select: (raw) => ({
      earnedInPeriod: raw.earned[period],
      totalReferrals: raw.totalReferrals,
      referralsInPeriod: raw.joined[period],
    }),
    enabled: !!email,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
};

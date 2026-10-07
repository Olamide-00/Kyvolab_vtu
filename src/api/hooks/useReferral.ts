import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";
import useAuthStore from "../../store/userStore";

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface EarningWindows {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
}

export interface CashbackSummary extends EarningWindows {
  transactions: number;
}

export interface ReferralSummary extends EarningWindows {
  totalReferrals: number;
  activeReferrals: number;
  transactions: number;
}

export interface ReferralOverview {
  referralCode: string;
  cashback: CashbackSummary;
  referral: ReferralSummary;
  totalEarned: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
}

export interface ReferralStats {
  totalReferrals: number;
  newReferrals: { today: number; thisWeek: number; thisMonth: number };
  activeReferrals: number;
  inactiveReferrals: number;
  conversionRate: number;
  referralTransactions: number;
  totalEarned: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  averageEarnedPerActiveReferral: number;
  topReferral: { name: string; earned: number } | null;
}

export interface CommissionTerms {
  cashbackPercent: number;
  referralPercent: number;
  referralLevels: number;
  unlimitedReferrals: boolean;
  basis: string;
}

export type EarningType = "all" | "cashback" | "referral";

export interface EarningHistoryItem {
  id: string;
  type: "cashback" | "referral";
  amount: number;
  service: string;
  category: string;
  transactionAmount: number;
  referredName: string | null;
  date: string;
}

export interface ReferralListItem {
  id: string;
  name: string;
  joinedAt: string;
  transactions: number;
  earned: number;
  lastTransactionAt: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EarningHistoryPage {
  earnings: EarningHistoryItem[];
  pagination: Pagination;
}

interface ReferralListPage {
  referrals: ReferralListItem[];
  pagination: Pagination;
}

export interface MonthlyEarning {
  month: string;
  cashback: number;
  referral: number;
  total: number;
}

export interface ServiceEarning {
  category: string;
  label: string;
  cashback: number;
  referral: number;
  total: number;
  transactions: number;
}

const useEmail = (): string =>
  useAuthStore((state: any) => state.userData?.email) || "";

export const useReferralOverview = () => {
  const email = useEmail();

  return useQuery<ReferralOverview, Error>({
    queryKey: ["referral", "me", email],
    queryFn: async () => {
      const response = await axiosInstance.get<Envelope<ReferralOverview>>(
        API_ENDPOINTS.REFERRAL_ME,
      );
      return response.data.data;
    },
    enabled: !!email,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useReferralStats = () => {
  const email = useEmail();

  return useQuery<ReferralStats, Error>({
    queryKey: ["referral", "stats", email],
    queryFn: async () => {
      const response = await axiosInstance.get<Envelope<ReferralStats>>(
        API_ENDPOINTS.REFERRAL_STATS,
      );
      return response.data.data;
    },
    enabled: !!email,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useCommissionTerms = () => {
  return useQuery<CommissionTerms, Error>({
    queryKey: ["referral", "terms"],
    queryFn: async () => {
      const response = await axiosInstance.get<Envelope<CommissionTerms>>(
        API_ENDPOINTS.REFERRAL_TERMS,
      );
      return response.data.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useEarningHistory = (
  type: EarningType,
  limit = 15,
  enabled = true,
) => {
  const email = useEmail();

  return useInfiniteQuery<EarningHistoryPage, Error>({
    queryKey: ["referral", "earnings", email, type],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<Envelope<EarningHistoryPage>>(
        API_ENDPOINTS.EARNINGS_HISTORY,
        { params: { type, page: pageParam, limit } },
      );
      return response.data.data;
    },
    getNextPageParam: (last: EarningHistoryPage) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    enabled: !!email && enabled,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useReferralList = (limit = 15, enabled = true) => {
  const email = useEmail();

  return useInfiniteQuery<ReferralListPage, Error>({
    queryKey: ["referral", "list", email],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<Envelope<ReferralListPage>>(
        API_ENDPOINTS.REFERRAL_LIST,
        { params: { page: pageParam, limit } },
      );
      return response.data.data;
    },
    getNextPageParam: (last: ReferralListPage) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    enabled: !!email && enabled,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useMonthlyEarnings = (months = 6) => {
  const email = useEmail();

  return useQuery<MonthlyEarning[], Error>({
    queryKey: ["referral", "monthly", email, months],
    queryFn: async () => {
      const response = await axiosInstance.get<Envelope<MonthlyEarning[]>>(
        API_ENDPOINTS.EARNINGS_MONTHLY,
        { params: { months } },
      );
      return response.data.data;
    },
    enabled: !!email,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useEarningsByService = () => {
  const email = useEmail();

  return useQuery<ServiceEarning[], Error>({
    queryKey: ["referral", "by-service", email],
    queryFn: async () => {
      const response = await axiosInstance.get<Envelope<ServiceEarning[]>>(
        API_ENDPOINTS.EARNINGS_BY_SERVICE,
      );
      return response.data.data;
    },
    enabled: !!email,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export interface ReferralCodeCheck {
  valid: boolean;
  referrerName?: string;
}

export const useValidateReferralCode = () => {
  return useMutation<
    ReferralCodeCheck,
    AxiosError<{ message?: string }>,
    string
  >({
    mutationFn: async (code) => {
      const response = await axiosInstance.get<ReferralCodeCheck>(
        API_ENDPOINTS.VALIDATE_REFERRAL_CODE(code),
      );
      return response.data;
    },
  });
};

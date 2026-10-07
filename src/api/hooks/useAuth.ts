import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import { AxiosError } from "axios";
import { API_ENDPOINTS } from "../endpoints";

// ─── Types ────────────────────────────────────────────────────

// Step 1: email only
interface SendRegistrationOTPData {
  email: string;
}

// Step 2: email + otp
interface OtpData {
  email: string;
  otp: string;
}

// Step 3: full details
interface CompleteRegistrationData {
  email: string;
  fullName: string;
  password: string;
  transactionPIN: string;
  pushToken?: string | null;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  referralCode?: string;
  deviceId?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResendOtpData {
  email: string;
}

interface ResetOTPRequest {
  email: string;
}

interface UpdatePasswordRequest {
  email: string;
  otp: string;
  password: string;
}

interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  pushToken?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Step 1: Send registration OTP ───────────────────────────
const useSendRegistrationOTP = () => {
  return useMutation<ApiResponse<any>, AxiosError, SendRegistrationOTPData>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.SEND_REGISTRATION_OTP,
        data,
      );
      return response.data;
    },
  });
};

// ─── Step 2: Verify OTP ───────────────────────────────────────
const useVerifyOtp = () => {
  return useMutation<ApiResponse<any>, AxiosError, OtpData>({
    mutationFn: async (otpData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.VERIFY_OTP,
        otpData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("OTP Verified Successfully:", data);
    },
  });
};

// ─── Step 3: Complete registration ───────────────────────────
const useCompleteRegistration = () => {
  return useMutation<ApiResponse<any>, AxiosError, CompleteRegistrationData>({
    mutationFn: async (userData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.REGISTER,
        userData,
      );
      return response.data;
    },
  });
};

// ─── Login ────────────────────────────────────────────────────
const useLogin = () => {
  return useMutation<ApiResponse<{ token: string }>, AxiosError, LoginData>({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post<ApiResponse<{ token: string }>>(
        API_ENDPOINTS.LOGIN,
        credentials,
      );
      return response.data;
    },
  });
};

// ─── Resend OTP ───────────────────────────────────────────────
const useResendOtp = () => {
  return useMutation<ApiResponse<any>, AxiosError, ResendOtpData>({
    mutationFn: async (emailData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.RESEND_OTP,
        emailData,
      );
      return response.data;
    },
  });
};

// ─── Get wallet balance ───────────────────────────────────────
const useGetBalance = (email: string) => {
  const {
    data: balance,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["balance", email],
    queryFn: async () => {
      if (!email) throw new Error("Email is required");
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GET_BALANCE}/${email}`,
      );
      return response.data;
    },
    staleTime: 0,
  });

  return { balance, isLoading, isError, refetch };
};

// ─── PIN OTP ──────────────────────────────────────────────────
const usePINOtp = () => {
  return useMutation<ApiResponse<any>, AxiosError>({
    mutationFn: async (emailData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.PIN_OTP,
        emailData,
      );
      return response.data;
    },
  });
};

// ─── Update PIN ───────────────────────────────────────────────
const useUpdatePIN = () => {
  return useMutation<ApiResponse<any>, AxiosError>({
    mutationFn: async (pinData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.UPDATE_PIN,
        pinData,
      );
      return response.data;
    },
  });
};

// ─── Update phone number ──────────────────────────────────────
const useUpdateNumber = () => {
  return useMutation<ApiResponse<any>, AxiosError>({
    mutationFn: async (phoneData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.UPDATE_NUMBER,
        phoneData,
      );
      return response.data;
    },
  });
};

// ─── Update profile ──────────────────────────────────────────
const useUpdateProfile = () => {
  return useMutation<
    ApiResponse<any>,
    AxiosError,
    { email: string; data: UpdateProfileData }
  >({
    mutationFn: async ({ email, data }) => {
      const response = await axiosInstance.put<ApiResponse<any>>(
        `${API_ENDPOINTS.UPDATE_PROFILE}/${email}`,
        data,
      );
      return response.data;
    },
  });
};

// ─── Reset password OTP ───────────────────────────────────────
const useResetOTP = () => {
  return useMutation<ApiResponse<any>, AxiosError, ResetOTPRequest>({
    mutationFn: async (otpData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.RESET_OTP,
        otpData,
      );
      return response.data;
    },
  });
};

// ─── Update password ──────────────────────────────────────────
const useUpdatePassword = () => {
  return useMutation<ApiResponse<any>, AxiosError, UpdatePasswordRequest>({
    mutationFn: async (passwordData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.UPDATE_PASSWORD,
        passwordData,
      );
      return response.data;
    },
  });
};

// ─── Set profile picture ──────────────────────────────────────
const useSetProfilePicture = () => {
  return useMutation<ApiResponse<any>, AxiosError>({
    mutationFn: async (profilePictureData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        API_ENDPOINTS.SET_PROFILE_PICTURE,
        profilePictureData,
      );
      return response.data;
    },
  });
};

// ─── Delete account ───────────────────────────────────────────
const useDeleteAccount = () => {
  return useMutation<ApiResponse<any>, AxiosError, string>({
    mutationFn: async (email: string) => {
      const response = await axiosInstance.delete<ApiResponse<any>>(
        `${API_ENDPOINTS.DELETE_ACCOUNT}/${email}`,
      );
      return response.data;
    },
  });
};

export {
  useSendRegistrationOTP,
  useVerifyOtp,
  useCompleteRegistration,
  useLogin,
  useResendOtp,
  useGetBalance,
  usePINOtp,
  useUpdatePIN,
  useUpdateNumber,
  useResetOTP,
  useUpdatePassword,
  useSetProfilePicture,
  useDeleteAccount,
  useUpdateProfile,
};

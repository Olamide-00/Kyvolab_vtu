export const API_ENDPOINTS = {
  // auth endpoint

  SEND_REGISTRATION_OTP: "/user/send-registration-otp",
  VERIFY_OTP: "/user/verify-otp",
  REGISTER: "/user/register",
  RESEND_OTP: "/user/resend-otp",
  LOGIN: "/user/login",
  DELETE_ACCOUNT: "/user/delete",

  //
  PROFILE_PICTURE: "/user/set-profile-picture",
  GET_BALANCE: "/user/balance",
  PIN_OTP: "/user/forgotOTP",
  UPDATE_PIN: "/PIN/update-pin",
  UPDATE_NUMBER: "/user/update-phone-number",
  RESET_OTP: "/user/init-OTP",
  UPDATE_PASSWORD: "/user/verify-reset-OTP",
  SET_PROFILE_PICTURE: "/user/set-profile-picture",
  UPDATE_PROFILE: "/user/update-profile",

  // wallets endpoint
  CREATE_WALLET: "/wallet/create-account",
  WALLET_DETAILS: (email: string) => `/wallet/account-details/${email}`,

  // PIN endpoints
  VERIFY_PIN: "/PIN/verify-PIN",

  //bills endpoints
  PAY_BILLS: "/bills/pay-bill",
  ALL_SERVICES: (identifier: string) =>
    `/bills/get-services?identifier=${identifier}`,
  SERVICE_PLAN: (serviceID: string) =>
    `/bills/get-packages?serviceID=${serviceID}`,
  BILLS_HISTORIES: "/bills/get-bills-history",
  FEE_QUOTE: (serviceID: string, amount: number) =>
    `/bills/fee-quote?serviceID=${serviceID}&amount=${amount}`,

  // verification
  VERIFY: "/verify",
  VERIFY_BANK: "wallet/verify-bank",

  // banking services
  TRANSFER: "/transfer",
  ALL_BANKS: "/bank/banks",
  FIND_REMIT_TAG: "/findRemit",
  TRANSFER_REMIT: "/transferRemit",
  FUNDING_HISTORY: "/bank/funding-history",

  // referrals and commission earnings
  REFERRAL_ME: "/referral/me",
  REFERRAL_STATS: "/referral/stats",
  REFERRAL_TERMS: "/referral/terms",
  REFERRAL_LIST: "/referral/referrals",
  EARNINGS_SUMMARY: "/referral/earnings",
  EARNINGS_HISTORY: "/referral/earnings/history",
  EARNINGS_MONTHLY: "/referral/earnings/monthly",
  EARNINGS_BY_SERVICE: "/referral/earnings/by-service",
  VALIDATE_REFERRAL_CODE: (code: string) =>
    `/user/referral-code/${encodeURIComponent(code)}`,

  // percentage
  PERCENTAGE: "/percentage",
};

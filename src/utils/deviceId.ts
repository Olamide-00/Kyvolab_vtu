import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const DEVICE_ID_KEY = "kyvo_device_id";

let cached: string | null = null;

export const getDeviceId = async (): Promise<string | undefined> => {
  if (cached) return cached;

  try {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) {
      cached = existing;
      return existing;
    }

    const created = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
    cached = created;
    return created;
  } catch {
    return undefined;
  }
};

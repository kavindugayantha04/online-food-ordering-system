import { Platform } from "react-native";
import { getAuthSession } from "./authStorage";
import { API_BASE_URL } from "./api";

const getTokenOrThrow = async () => {
  const session = await getAuthSession();
  if (!session?.token) {
    throw new Error("Please login first.");
  }
  return session.token;
};

export const applyVoucher = async ({ code, cartTotal, voucherImageAsset }) => {
  const token = await getTokenOrThrow();
  const formData = new FormData();

  formData.append("code", code);
  formData.append("cartTotal", String(cartTotal || 0));

  if (voucherImageAsset?.uri) {
    if (Platform.OS === "web" && voucherImageAsset.file) {
      formData.append("voucherImage", voucherImageAsset.file, voucherImageAsset.file.name);
    } else {
      formData.append("voucherImage", {
        uri: voucherImageAsset.uri,
        name: voucherImageAsset.fileName || `voucher-${Date.now()}.jpg`,
        type: voucherImageAsset.mimeType || "image/jpeg",
      });
    }
  }

  const response = await fetch(`${API_BASE_URL}/voucher/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Could not apply voucher.");
    error.response = { data, status: response.status };
    throw error;
  }

  return data;
};

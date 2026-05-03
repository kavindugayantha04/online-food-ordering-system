const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const applyVoucherApi = async (
  voucherCode,
  cartTotal,
  voucherImage,
  token
) => {
  const formData = new FormData();

  formData.append("voucherCode", voucherCode);
  formData.append("cartTotal", cartTotal.toString());

  if (voucherImage) {
    formData.append("voucherImage", {
      uri: voucherImage.uri,
      name: voucherImage.fileName || "voucher.png",
      type: voucherImage.mimeType || "image/png",
    });
  }

  const response = await fetch(`${API_URL}/vouchers/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    // Log raw server response for debugging only.
    console.log("RAW VOUCHER RESPONSE:", text);
    console.log("STATUS:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to apply voucher (${response.status})`);
    }

    throw new Error("Server returned invalid response");
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to apply voucher");
  }

  return data;
};

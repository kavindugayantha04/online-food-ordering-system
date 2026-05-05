const API_URL = process.env.EXPO_PUBLIC_API_URL;

const handleResponse = async (res, defaultMessage) => {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(
        `${defaultMessage || "Request failed"} (${res.status})`
      );
    }
    throw new Error(defaultMessage || "Server returned invalid response");
  }
  if (!res.ok) {
    throw new Error(data.message || defaultMessage || "Request failed");
  }
  return data;
};

export const createDeliveryApi = async (deliveryData, token) => {
  const res = await fetch(`${API_URL}/delivery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deliveryData),
  });
  return handleResponse(res, "Failed to create delivery");
};

export const getAllDeliveriesApi = async (token) => {
  const res = await fetch(`${API_URL}/delivery`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res, "Failed to fetch deliveries");
};

export const getDriverDeliveriesApi = async (token) => {
  const res = await fetch(`${API_URL}/delivery/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res, "Failed to fetch your deliveries");
};

export const getDeliveryByOrderIdApi = async (orderId, token) => {
  const res = await fetch(`${API_URL}/delivery/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res, "Failed to fetch delivery");
};

/**
 * @param {string} proofImageUri - local file uri from image picker, or null
 */
export const updateDeliveryStatusApi = async (
  deliveryId,
  status,
  proofImageUri,
  token
) => {
  if (proofImageUri) {
    const formData = new FormData();
    formData.append("status", status);
    const ext = proofImageUri.split(".").pop()?.toLowerCase() || "jpg";
    const name = `proof.${ext === "jpg" ? "jpg" : ext}`;
    formData.append("proofImage", {
      uri: proofImageUri,
      name,
      type:
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg",
    });

    const res = await fetch(`${API_URL}/delivery/${deliveryId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(res, "Failed to update delivery status");
  }

  const res = await fetch(`${API_URL}/delivery/${deliveryId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res, "Failed to update delivery status");
};

export const updateDeliveryLocationApi = async (
  deliveryId,
  deliveryLocation,
  token
) => {
  const res = await fetch(`${API_URL}/delivery/${deliveryId}/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ deliveryLocation }),
  });
  return handleResponse(res, "Failed to update delivery location");
};

export const deleteDeliveryApi = async (deliveryId, token) => {
  const res = await fetch(`${API_URL}/delivery/${deliveryId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res, "Failed to delete delivery");
};

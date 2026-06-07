const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

// Create payment + order via multipart/form-data
export const createPaymentApi = async (paymentPayload, token) => {
  const {
    orderData,
    paymentMethod,
    paymentStatus,
    transactionId,
    receiptImage,
  } = paymentPayload;

  // Extract customImage (local URI) before JSON-stringifying orderData so it
  // can be uploaded as a proper file rather than a plain string.
  const { customImage, ...orderDataWithoutImage } = orderData || {};

  const formData = new FormData();

  formData.append("orderData", JSON.stringify(orderDataWithoutImage));
  formData.append("paymentMethod", paymentMethod || "");
  formData.append("paymentStatus", paymentStatus || "");
  formData.append("transactionId", transactionId || "");

  if (receiptImage && receiptImage.uri) {
    const filename =
      receiptImage.name ||
      receiptImage.fileName ||
      `receipt-${Date.now()}.jpg`;

    const type =
      receiptImage.mimeType || receiptImage.type || "image/jpeg";

    formData.append("receiptImage", {
      uri: receiptImage.uri,
      name: filename,
      type,
    });
  }

  // Append cake image if the user uploaded one (local URI from ImagePicker)
  if (customImage && !customImage.startsWith("/uploads")) {
    const uriParts = customImage.split("/");
    const filename = uriParts[uriParts.length - 1] || `cake-${Date.now()}.jpg`;
    formData.append("customImage", {
      uri: customImage,
      name: filename,
      type: "image/jpeg",
    });
  }

  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      ...getAuthHeader(token),
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment");
  }

  return data;
};

export const getPaymentsApi = async (token) => {
  const response = await fetch(`${API_URL}/payments`, {
    method: "GET",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch payments");
  }

  return data;
};

export const approvePaymentApi = async (paymentId, token) => {
  const response = await fetch(`${API_URL}/payments/${paymentId}/approve`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve payment");
  }

  return data;
};

export const rejectPaymentApi = async (paymentId, token) => {
  const response = await fetch(`${API_URL}/payments/${paymentId}/reject`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject payment");
  }

  return data;
};

export const deletePaymentApi = async (paymentId, token) => {
  const response = await fetch(`${API_URL}/payments/${paymentId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete payment");
  }

  return data;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createOrderApi = async (orderData, token) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
};

export const getMyOrdersApi = async (token) => {
  const response = await fetch(`${API_URL}/orders/my`, {
    method: "GET",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch orders");
  }

  return data;
};

export const getOrderByIdApi = async (orderId, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch order");
  }

  return data;
};

export const cancelOrderApi = async (orderId, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel order");
  }

  return data;
};

export const adminCancelOrderApi = async (orderId, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/admin-cancel`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel order");
  }

  return data;
};

export const deleteOrderApi = async (orderId, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete order");
  }

  return data;
};

export const addItemsToOrderApi = async (orderId, items, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/add-items`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ items }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add items to order");
  }

  return data;
};

export const getAllOrdersApi = async (token) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "GET",
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch all orders");
  }

  return data;
};

export const updateOrderStatusApi = async (orderId, status, token) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  return data;
};
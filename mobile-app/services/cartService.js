import api from "./api";
import { getAuthSession } from "./authStorage";

const getTokenOrThrow = async () => {
  const session = await getAuthSession();
  if (!session?.token) {
    throw new Error("Please login first.");
  }
  return session.token;
};

export const getCart = async () => {
  const token = await getTokenOrThrow();
  const response = await api.get("/cart", token);
  return response.data;
};

export const addCartItem = async ({ foodName, image, price, quantity }) => {
  const token = await getTokenOrThrow();
  const response = await api.post("/cart", { foodName, image, price, quantity }, token);
  return response.data;
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  const token = await getTokenOrThrow();
  const response = await api.put(`/cart/${itemId}`, { quantity }, token);
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const token = await getTokenOrThrow();
  const response = await api.delete(`/cart/${itemId}`, token);
  return response.data;
};

export const clearCartItems = async () => {
  const token = await getTokenOrThrow();
  const response = await api.delete("/cart", token);
  return response.data;
};

// hooks/useDelivery.js

import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constants/config";

export default function useDelivery() {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get delivery by orderId
  const fetchDelivery = async (orderId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/delivery/${orderId}`);
      console.log(`${BASE_URL}/api/delivery/${orderId}`);
      setDelivery(res.data);
    } catch (err) {
      console.log("Error fetching delivery:", err.message);
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (deliveryId, formData) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/delivery/status/${deliveryId}`,
        formData
      );
      return res.data;
    } catch (err) {
      console.log("Error updating status:", err.response?.data || err.message);
      throw err;
    }
  };
  return { delivery, loading, fetchDelivery, updateStatus };
}
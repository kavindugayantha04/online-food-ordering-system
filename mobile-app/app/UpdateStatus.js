// app/UpdateStatus.js

import React from "react";
import { View } from "react-native";
import useDelivery from "../hooks/useDelivery";
import StatusButton from "../components/StatusButton";

export default function UpdateStatus() {
  const { updateStatus } = useDelivery();

  const deliveryId = "YOUR_DELIVERY_ID"; // replace

  return (
    <View style={{ padding: 20 }}>
      <StatusButton
        title="On the way"
        onPress={() => updateStatus(deliveryId, "On the way")}
      />

      <StatusButton
        title="Delivered"
        onPress={() => updateStatus(deliveryId, "Delivered")}
      />
    </View>
  );
}
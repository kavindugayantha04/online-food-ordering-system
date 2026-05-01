// components/StatusButton.js

import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function StatusButton({ title, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#007bff",
        padding: 10,
        margin: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "white", textAlign: "center" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../constants/config";
import { Image } from "react-native";
import { ScrollView } from "react-native";


import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import useDelivery from "../hooks/useDelivery";

export default function TrackDelivery() {
  const { delivery, loading, fetchDelivery } = useDelivery();
  const [locationInput, setLocationInput] = useState("");
  const [saving, setSaving] = useState(false);

  const orderId = "69e31f8f23135b7227d66987";

  useEffect(() => {
    fetchDelivery(orderId);
  }, []);

  // Delivery load unama existing location set karamu
  useEffect(() => {
    if (delivery?.deliveryLocation) {
      setLocationInput(delivery.deliveryLocation);
    }
  }, [delivery]);

  const handleSaveLocation = async () => {
    if (!locationInput.trim()) {
      Alert.alert("Error", "Location empty karanna epa!");
      return;
    }

    if (!delivery?._id) {
      Alert.alert("Error", "Delivery not loaded yet");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/delivery/${delivery._id}/location`,
        {
          method: "PUT", // ✅ FIXED
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryLocation: locationInput,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Location updated! ✅");
        fetchDelivery(orderId); // 🔥 refresh UI
      } else {
        Alert.alert("Error", data.message || "Update failed");
      }
    } catch (err) {
      Alert.alert("Error", "Server connect wenna bari!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Tracking your delivery...</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No Delivery Found 😕</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🚚 Track Delivery</Text>

      {/* Driver Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Driver</Text>
        <Text style={styles.value}>{delivery.driverName}</Text>
      </View>

       <View style={styles.card}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{delivery.deliveryLocation}</Text>
        </View>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, styles.status]}>{delivery.status}</Text>
      </View>

      {/* ETA Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Estimated Time</Text>
        <Text style={styles.value}>
          {delivery.estimatedTime} ({new Date(delivery.deliveredAt).toLocaleString()})
        </Text>
      </View>

      {/* 📍 Delivery Location Edit Card */}

      {delivery.status !== "Delivered" && (
        <View style={styles.card}>
          <Text style={styles.label}>📍 Delivery Location</Text>

          <TextInput
            style={styles.textInput}
            value={locationInput}
            onChangeText={setLocationInput}
            placeholder="Enter delivery location..."
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveLocation}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Location"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* {delivery.status == "Delivered" && (
        <View style={styles.card}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{delivery.deliveryLocation}</Text>
        </View>
      )} */}



      {delivery?.proofImage && (
        <View style={styles.card}>
          <Text style={styles.label}>📸 Proof Image</Text>

          <Image
            source={{ uri: delivery.proofImage }}
            style={styles.previewImage}
          />
        </View>
      )}

        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  status: {
    color: "#F97316",
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB", // ✅ fixed
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#111827",
    marginTop: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#F97316",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#FCD9B6",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    marginTop: 10,
  },
});
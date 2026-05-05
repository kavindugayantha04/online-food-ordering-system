import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDriversApi } from "../services/api";
import { createDeliveryApi } from "../services/deliveryService";

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawOrderId = params.orderId;
  const rawLoc = params.deliveryLocation;
  const orderId = rawOrderId
    ? String(Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId)
    : "";
  const initialLocation = rawLoc
    ? String(Array.isArray(rawLoc) ? rawLoc[0] : rawLoc)
    : "";

  const [deliveryLocation, setDeliveryLocation] = useState(initialLocation);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [driverNameManual, setDriverNameManual] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDeliveryLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setLoadingDrivers(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const data = await getDriversApi(token);
        setDrivers(data.drivers || []);
      } catch {
        /* list optional */
        setDrivers([]);
      } finally {
        setLoadingDrivers(false);
      }
    };
    loadDrivers();
  }, []);

  const selectDriver = (d) => {
    setSelectedDriverId(d._id);
    setDriverNameManual("");
  };

  const clearDriverSelection = () => {
    setSelectedDriverId(null);
  };

  const handleCreate = async () => {
    if (!orderId) {
      Alert.alert("Error", "Missing order. Go back to admin orders.");
      return;
    }
    if (!deliveryLocation.trim()) {
      Alert.alert("Validation", "Delivery location is required.");
      return;
    }
    if (!selectedDriverId && !driverNameManual.trim()) {
      Alert.alert(
        "Validation",
        "Select a driver from the list or enter a driver name."
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const payload = {
        orderId,
        deliveryLocation: deliveryLocation.trim(),
        estimatedTime: estimatedTime.trim(),
      };
      if (selectedDriverId) {
        payload.driverId = selectedDriverId;
      } else {
        payload.driverName = driverNameManual.trim();
      }

      await createDeliveryApi(payload, token);
      Alert.alert("Success", "Delivery assigned.");
      router.replace("/admin-delivery");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not create delivery");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <View style={styles.center}>
        <Text style={styles.missingText}>No order selected.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Assign delivery</Text>
      <Text style={styles.sub}>Order ID (ref): {orderId}</Text>

      <Text style={styles.label}>Delivery location</Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        placeholderTextColor="#888"
        value={deliveryLocation}
        onChangeText={setDeliveryLocation}
        multiline
      />

      <Text style={styles.label}>Estimated time (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 30–45 min"
        placeholderTextColor="#888"
        value={estimatedTime}
        onChangeText={setEstimatedTime}
      />

      <Text style={styles.label}>Driver from system</Text>
      {loadingDrivers ? (
        <ActivityIndicator color="#F97316" style={{ marginBottom: 12 }} />
      ) : drivers.length === 0 ? (
        <Text style={styles.hint}>No driver accounts yet. Use name below.</Text>
      ) : (
        <View style={styles.driverList}>
          {drivers.map((d) => {
            const active = selectedDriverId === d._id;
            return (
              <TouchableOpacity
                key={d._id}
                style={[styles.driverChip, active && styles.driverChipActive]}
                onPress={() => selectDriver(d)}
              >
                <Text
                  style={[styles.driverChipText, active && styles.driverChipTextActive]}
                >
                  {d.name} ({d.email})
                </Text>
              </TouchableOpacity>
            );
          })}
          {selectedDriverId ? (
            <TouchableOpacity onPress={clearDriverSelection}>
              <Text style={styles.clearLink}>Clear selection</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <Text style={styles.label}>Or driver name (if not in list)</Text>
      <TextInput
        style={styles.input}
        placeholder="Driver full name"
        placeholderTextColor="#888"
        value={driverNameManual}
        onChangeText={(t) => {
          setDriverNameManual(t);
          if (t.trim()) setSelectedDriverId(null);
        }}
      />

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitDisabled]}
        onPress={handleCreate}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Create delivery</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  missingText: { color: "#6B7280", marginBottom: 16 },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  backText: { color: "#F97316", fontWeight: "800" },
  title: { fontSize: 26, fontWeight: "900", color: "#111827" },
  sub: { color: "#6B7280", marginTop: 6, marginBottom: 16 },
  label: {
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  hint: { color: "#6B7280", marginBottom: 10, fontSize: 14 },
  driverList: { gap: 8, marginBottom: 8 },
  driverChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 12,
  },
  driverChipActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFEDD5",
  },
  driverChipText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  driverChipTextActive: { color: "#C2410C" },
  clearLink: {
    color: "#F97316",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 8,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getAllDeliveriesApi,
  deleteDeliveryApi,
} from "../services/deliveryService";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const getImageUri = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
};

const shortId = (id) => {
  if (!id) return "—";
  const s = String(id);
  return s.slice(-6).toUpperCase();
};

export default function AdminDeliveryScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullImage, setFullImage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      const data = await getAllDeliveriesApi(token);
      setDeliveries(data.deliveries || []);
    } catch (e) {
      Alert.alert("Error", e.message || "Could not load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleDelete = (delivery) => {
    if (delivery.status !== "Cancelled") return;
    Alert.alert(
      "Delete delivery",
      "Remove this cancelled delivery from the list?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(delivery._id);
              const token = await AsyncStorage.getItem("token");
              await deleteDeliveryApi(delivery._id, token);
              Alert.alert("Success", "Delivery deleted.");
              load();
            } catch (e) {
              Alert.alert("Error", e.message || "Delete failed");
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading deliveries…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Delivery Management</Text>
        <Text style={styles.subtitle}>All assigned deliveries</Text>

        {deliveries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No deliveries yet</Text>
            <Text style={styles.emptyText}>
              When an order is Out for Delivery, assign a driver from the create
              delivery screen.
            </Text>
          </View>
        ) : (
          deliveries.map((d) => {
            const order = d.orderId;
            const driverUser = d.driverId;
            const driverLabel =
              driverUser?.name ||
              d.driverName ||
              (driverUser?.email ? driverUser.email : "—");
            const busy = busyId === d._id;

            return (
              <View key={d._id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  Order #{shortId(order?._id || order)}
                </Text>
                <Text style={styles.line}>
                  <Text style={styles.bold}>Driver: </Text>
                  {driverLabel}
                </Text>
                <Text style={styles.line}>
                  <Text style={styles.bold}>Location: </Text>
                  {d.deliveryLocation}
                </Text>
                {d.estimatedTime ? (
                  <Text style={styles.line}>
                    <Text style={styles.bold}>ETA: </Text>
                    {d.estimatedTime}
                  </Text>
                ) : null}
                <Text style={styles.line}>
                  <Text style={styles.bold}>Status: </Text>
                  {d.status}
                </Text>
                {order?.totalPrice != null ? (
                  <Text style={styles.line}>
                    <Text style={styles.bold}>Order total: </Text>
                    Rs. {Number(order.totalPrice).toFixed(2)}
                  </Text>
                ) : null}

                {d.proofImage ? (
                  <TouchableOpacity
                    style={styles.proofWrap}
                    activeOpacity={0.85}
                    onPress={() => {
                      setFullImage(getImageUri(d.proofImage));
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.proofLabel}>Proof of delivery</Text>
                    <Image
                      source={{ uri: getImageUri(d.proofImage) }}
                      style={styles.proofThumb}
                    />
                    <Text style={styles.tapHint}>Tap to view full screen</Text>
                  </TouchableOpacity>
                ) : null}

                {busy ? (
                  <ActivityIndicator color="#F97316" style={{ marginTop: 12 }} />
                ) : d.status === "Cancelled" ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(d)}
                  >
                    <Text style={styles.deleteText}>Delete delivery</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {fullImage ? (
            <Image
              source={{ uri: fullImage }}
              style={styles.fullImg}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, color: "#6B7280" },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  backText: { color: "#F97316", fontWeight: "800" },
  title: { fontSize: 28, fontWeight: "900", color: "#111827" },
  subtitle: { color: "#6B7280", marginTop: 4, marginBottom: 18 },
  empty: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  emptyText: { marginTop: 8, color: "#6B7280", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F97316",
    marginBottom: 10,
  },
  line: { color: "#374151", marginBottom: 6 },
  bold: { fontWeight: "800", color: "#111827" },
  proofWrap: { marginTop: 12 },
  proofLabel: { fontWeight: "800", color: "#111827", marginBottom: 8 },
  proofThumb: {
    width: "100%",
    height: 140,
    borderRadius: 12,
  },
  tapHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  deleteBtn: {
    marginTop: 14,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "800" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
  },
  modalClose: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  modalCloseText: { color: "#fff", fontWeight: "900" },
  fullImg: { width: "100%", height: "80%" },
});

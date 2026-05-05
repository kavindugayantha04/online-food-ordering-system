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
import * as ImagePicker from "expo-image-picker";

import {
  getDriverDeliveriesApi,
  updateDeliveryStatusApi,
} from "../services/deliveryService";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const getImageUri = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
};

export default function DriverDeliveryScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [previewDeliveryId, setPreviewDeliveryId] = useState(null);
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
      const data = await getDriverDeliveriesApi(token);
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

  const pickProofAndDeliver = async (deliveryId) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload delivery proof."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setPreviewUri(result.assets[0].uri);
    setPreviewDeliveryId(deliveryId);
  };

  const submitDelivered = async () => {
    if (!previewDeliveryId || !previewUri) return;
    try {
      setBusyId(previewDeliveryId);
      const token = await AsyncStorage.getItem("token");
      await updateDeliveryStatusApi(
        previewDeliveryId,
        "Delivered",
        previewUri,
        token
      );
      setPreviewUri(null);
      setPreviewDeliveryId(null);
      Alert.alert("Success", "Marked as delivered.");
      load();
    } catch (e) {
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const cancelPreview = () => {
    setPreviewUri(null);
    setPreviewDeliveryId(null);
  };

  const setStatus = async (deliveryId, status) => {
    try {
      setBusyId(deliveryId);
      const token = await AsyncStorage.getItem("token");
      await updateDeliveryStatusApi(deliveryId, status, null, token);
      Alert.alert("Success", `Status: ${status}`);
      load();
    } catch (e) {
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const shortOrderId = (order) => {
    const id = order?._id || order;
    if (!id) return "—";
    const s = String(id);
    return s.slice(-6).toUpperCase();
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

        <Text style={styles.title}>My Deliveries</Text>
        <Text style={styles.subtitle}>Assigned to you</Text>

        {deliveries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No active deliveries</Text>
            <Text style={styles.emptyText}>
              When an admin assigns an order, it will show up here.
            </Text>
          </View>
        ) : (
          deliveries.map((d) => {
            const order = d.orderId;
            const busy = busyId === d._id;
            return (
              <View key={d._id} style={styles.card}>
                <Text style={styles.orderLabel}>
                  Order #{shortOrderId(order)}
                </Text>
                <Text style={styles.rowText}>
                  <Text style={styles.bold}>Location: </Text>
                  {d.deliveryLocation}
                </Text>
                {d.estimatedTime ? (
                  <Text style={styles.rowText}>
                    <Text style={styles.bold}>ETA: </Text>
                    {d.estimatedTime}
                  </Text>
                ) : null}
                <Text style={styles.rowText}>
                  <Text style={styles.bold}>Status: </Text>
                  {d.status}
                </Text>
                {order?.totalPrice != null ? (
                  <Text style={styles.total}>
                    Total: Rs. {Number(order.totalPrice).toFixed(2)}
                  </Text>
                ) : null}

                {busy ? (
                  <ActivityIndicator color="#F97316" style={{ marginTop: 12 }} />
                ) : (
                  <View style={styles.actions}>
                    {d.status === "Assigned" ? (
                      <TouchableOpacity
                        style={styles.btn}
                        onPress={() => setStatus(d._id, "On the way")}
                      >
                        <Text style={styles.btnText}>Mark On the way</Text>
                      </TouchableOpacity>
                    ) : null}

                    {d.status === "On the way" || d.status === "Assigned" ? (
                      <TouchableOpacity
                        style={[styles.btn, styles.btnOutline]}
                        onPress={() => pickProofAndDeliver(d._id)}
                      >
                        <Text style={[styles.btnText, styles.btnOutlineText]}>
                          Mark Delivered (photo)
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {d.status !== "Delivered" && d.status !== "Cancelled" ? (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() =>
                          Alert.alert(
                            "Cancel delivery?",
                            "The order will be marked cancelled.",
                            [
                              { text: "No", style: "cancel" },
                              {
                                text: "Yes",
                                style: "destructive",
                                onPress: () => setStatus(d._id, "Cancelled"),
                              },
                            ]
                          )
                        }
                      >
                        <Text style={styles.cancelBtnText}>Cancel delivery</Text>
                      </TouchableOpacity>
                    ) : null}

                    {d.proofImage ? (
                      <TouchableOpacity
                        onPress={() => {
                          setFullImage(getImageUri(d.proofImage));
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: getImageUri(d.proofImage) }}
                          style={styles.thumb}
                        />
                        <Text style={styles.tapHint}>Tap proof to enlarge</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })
        )}

        {previewUri && previewDeliveryId ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Delivery proof preview</Text>
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImg}
              resizeMode="cover"
            />
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.cancelPreviewBtn}
                onPress={cancelPreview}
              >
                <Text style={styles.cancelPreviewText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitPreviewBtn}
                onPress={submitDelivered}
              >
                <Text style={styles.submitPreviewText}>Submit delivered</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
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
  subtitle: { color: "#6B7280", marginTop: 4, marginBottom: 18, fontWeight: "600" },
  empty: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F97316",
    marginBottom: 8,
  },
  rowText: { color: "#374151", marginBottom: 4, lineHeight: 20 },
  bold: { fontWeight: "800", color: "#111827" },
  total: {
    marginTop: 8,
    fontWeight: "900",
    color: "#111827",
  },
  actions: { marginTop: 14, gap: 10 },
  btn: {
    backgroundColor: "#F97316",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F97316",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  btnOutlineText: { color: "#F97316" },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: "#DC2626", fontWeight: "700" },
  thumb: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginTop: 8,
  },
  tapHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  previewBox: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  previewTitle: {
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },
  previewImg: {
    width: "100%",
    height: 200,
    borderRadius: 14,
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  cancelPreviewBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelPreviewText: { fontWeight: "700", color: "#374151" },
  submitPreviewBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  submitPreviewText: { fontWeight: "800", color: "#fff" },
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

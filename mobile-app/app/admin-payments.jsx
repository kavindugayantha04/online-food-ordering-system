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
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getPaymentsApi,
  approvePaymentApi,
  rejectPaymentApi,
  deletePaymentApi,
} from "../services/paymentService";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "";
const SERVER_URL = API_URL.replace("/api", "");

export default function AdminPaymentsScreen() {
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [previewUri, setPreviewUri] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const data = await getPaymentsApi(token);
      setPayments(data.payments || []);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const buildReceiptUri = (receiptImage) => {
    if (!receiptImage) return null;
    if (receiptImage.startsWith("http")) return receiptImage;
    return `${SERVER_URL}${receiptImage}`;
  };

  const handleApprove = async (paymentId) => {
    try {
      setActionLoadingId(paymentId);
      const token = await AsyncStorage.getItem("token");
      await approvePaymentApi(paymentId, token);
      Alert.alert("Success", "Payment approved.");
      loadPayments();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to approve payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = (paymentId) => {
    Alert.alert(
      "Reject Payment",
      "Are you sure you want to reject this payment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(paymentId);
              const token = await AsyncStorage.getItem("token");
              await rejectPaymentApi(paymentId, token);
              Alert.alert("Success", "Payment rejected.");
              loadPayments();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to reject payment.");
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (paymentId) => {
    Alert.alert(
      "Delete Payment",
      "Permanently remove this rejected payment record?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(paymentId);
              const token = await AsyncStorage.getItem("token");
              await deletePaymentApi(paymentId, token);
              Alert.alert("Success", "Payment deleted.");
              loadPayments();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete payment.");
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "#16A34A";
      case "Rejected":
        return "#DC2626";
      case "Waiting for Verification":
        return "#F59E0B";
      case "COD Pending":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const filters = [
    "All",
    "Waiting for Verification",
    "Paid",
    "Rejected",
    "COD Pending",
  ];

  const filteredPayments =
    selectedFilter === "All"
      ? payments
      : payments.filter((p) => p.status === selectedFilter);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Payment Admin</Text>
        <Text style={styles.subtitle}>
          Verify transfer receipts and manage payments
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredPayments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No payments found</Text>
            <Text style={styles.emptyText}>
              No payments match this filter.
            </Text>
          </View>
        ) : (
          filteredPayments.map((payment) => {
            const isLoading = actionLoadingId === payment._id;
            const receiptUri = buildReceiptUri(payment.receiptImage);
            const orderId = payment.orderId?._id || payment.orderId;
            const userName =
              payment.userId?.name || payment.userId?.email || "—";

            return (
              <View key={payment._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.paymentId} numberOfLines={1}>
                      Payment #{payment._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(payment.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  >
                    <Text style={styles.statusText} numberOfLines={1}>
                      {payment.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                  <Text style={styles.label}>Order ID</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {orderId
                      ? `#${String(orderId).slice(-6).toUpperCase()}`
                      : "—"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Customer</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {userName}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Method</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {payment.method === "online_transfer"
                      ? "Online Transfer"
                      : "Cash on Delivery"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.amountValue}>
                    Rs. {Number(payment.amount || 0).toFixed(2)}
                  </Text>
                </View>

                {payment.transactionId ? (
                  <View style={styles.row}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value} numberOfLines={1}>
                      {payment.transactionId}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.receiptBox}>
                  <Text style={styles.label}>Receipt</Text>

                  {receiptUri ? (
                    <TouchableOpacity
                      onPress={() => setPreviewUri(receiptUri)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: receiptUri }}
                        style={styles.receiptImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.receiptHint}>Tap to enlarge</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noReceiptBox}>
                      <Text style={styles.noReceiptText}>
                        No receipt uploaded
                      </Text>
                    </View>
                  )}
                </View>

                {isLoading ? (
                  <ActivityIndicator
                    color="#F97316"
                    style={{ marginTop: 12 }}
                  />
                ) : (
                  <View style={styles.actionRow}>
                    {payment.status === "Waiting for Verification" && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={() => handleApprove(payment._id)}
                        >
                          <Text style={styles.actionText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleReject(payment._id)}
                        >
                          <Text style={styles.actionText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {payment.status === "Rejected" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtn]}
                        onPress={() => handleDelete(payment._id)}
                      >
                        <Text style={styles.actionText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Image preview modal */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}
        >
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : null}
          <Text style={styles.modalHint}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 30,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },
  backText: {
    color: "#F97316",
    fontWeight: "900",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 18,
    fontWeight: "600",
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#111827",
  },
  filterText: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
  },
  activeFilterText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  paymentId: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  dateText: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    maxWidth: 160,
  },
  statusText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  label: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
  },
  value: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 13,
    flexShrink: 1,
    maxWidth: "60%",
    textAlign: "right",
  },
  amountValue: {
    color: "#F97316",
    fontWeight: "900",
    fontSize: 14,
  },
  receiptBox: {
    marginTop: 6,
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    marginTop: 8,
    backgroundColor: "#F3F4F6",
  },
  receiptHint: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  noReceiptBox: {
    marginTop: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
  },
  noReceiptText: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: "#16A34A",
  },
  rejectBtn: {
    backgroundColor: "#F59E0B",
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
  },
  actionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  emptyBox: {
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  modalHint: {
    marginTop: 14,
    color: "#fff",
    fontWeight: "700",
  },
});

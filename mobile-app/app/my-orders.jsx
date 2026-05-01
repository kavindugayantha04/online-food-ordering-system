import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getMyOrdersApi,
  cancelOrderApi,
  deleteOrderApi,
} from "../services/orderService";

export default function MyOrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const loadMyOrders = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const data = await getMyOrdersApi(token);
      setOrders(data.orders || []);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelLoadingId(orderId);

            const token = await AsyncStorage.getItem("token");
            await cancelOrderApi(orderId, token);

            Alert.alert("Success", "Order cancelled successfully.");
            loadMyOrders();
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to cancel order.");
          } finally {
            setCancelLoadingId(null);
          }
        },
      },
    ]);
  };

  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to permanently delete this cancelled order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteLoadingId(orderId);

              const token = await AsyncStorage.getItem("token");
              await deleteOrderApi(orderId, token);

              Alert.alert("Success", "Order deleted successfully.");
              loadMyOrders();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete order.");
            } finally {
              setDeleteLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return styles.pending;
      case "Confirmed":
        return styles.confirmed;
      case "Preparing":
        return styles.preparing;
      case "Ready for Pickup":
        return styles.ready;
      case "Out for Delivery":
        return styles.delivery;
      case "Delivered":
      case "Completed":
        return styles.completed;
      case "Cancelled":
        return styles.cancelled;
      default:
        return styles.pending;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Orders</Text>
      <Text style={styles.subtitle}>Track your food orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            Place your first order from the menu.
          </Text>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.push("/menu")}
          >
            <Text style={styles.menuBtnText}>Go to Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderId} numberOfLines={1}>
                  Order #{order._id.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              </View>

              <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                <Text style={styles.statusText} numberOfLines={1}>
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Items</Text>

            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>

                <Text style={styles.itemPrice} numberOfLines={1}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            {order.customMessage ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Cake Message</Text>
                <Text style={styles.noteText}>{order.customMessage}</Text>
              </View>
            ) : null}

            {order.notes ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Notes</Text>
                <Text style={styles.noteText}>{order.notes}</Text>
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <View style={styles.footerLeft}>
                <Text style={styles.typeLabel}>Order Type</Text>
                <Text style={styles.typeText} numberOfLines={1}>
                  {order.orderType === "pickup" ? "Pickup" : "Delivery"}
                </Text>
              </View>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue} numberOfLines={1}>
                  Rs. {Number(order.totalPrice || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {order.status === "Pending" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancelOrder(order._id)}
                disabled={cancelLoadingId === order._id}
              >
                {cancelLoadingId === order._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            )}

            {order.status === "Cancelled" && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteOrder(order._id)}
                disabled={deleteLoadingId === order._id}
              >
                {deleteLoadingId === order._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete Order</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 18,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  orderHeaderLeft: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  orderId: {
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
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
  },
  pending: {
    backgroundColor: "#F59E0B",
  },
  confirmed: {
    backgroundColor: "#3B82F6",
  },
  preparing: {
    backgroundColor: "#F97316",
  },
  ready: {
    backgroundColor: "#8B5CF6",
  },
  delivery: {
    backgroundColor: "#06B6D4",
  },
  completed: {
    backgroundColor: "#16A34A",
  },
  cancelled: {
    backgroundColor: "#DC2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  itemRow: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  itemInfo: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    flexWrap: "wrap",
  },
  itemQty: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  itemPrice: {
    color: "#F97316",
    fontWeight: "900",
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
  },
  noteLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
  },
  noteText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
    flexWrap: "wrap",
  },
  footerRow: {
    marginTop: 12,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  footerLeft: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  typeLabel: {
    color: "#D1D5DB",
    fontSize: 11,
    fontWeight: "700",
  },
  typeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "capitalize",
  },
  totalBox: {
    alignItems: "flex-end",
  },
  totalLabel: {
    color: "#D1D5DB",
    fontSize: 11,
    fontWeight: "700",
  },
  totalValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  backBtn: {
    padding: 14,
    alignItems: "center",
  },
  backText: {
    color: "#6B7280",
    fontWeight: "800",
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
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
  },
  menuBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 18,
  },
  menuBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});

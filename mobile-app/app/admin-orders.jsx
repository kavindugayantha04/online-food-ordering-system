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
  getAllOrdersApi,
  updateOrderStatusApi,
  deleteOrderApi,
  adminCancelOrderApi,
} from "../services/orderService";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const getImageUri = (path) => {
  if (!path) return null;
  if (path.startsWith("file://")) return path;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
};

export default function AdminOrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const data = await getAllOrdersApi(token);
      setOrders(data.orders || []);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const getNextStatuses = (order) => {
    if (order.orderType === "pickup") {
      return ["Confirmed", "Preparing", "Ready for Pickup", "Completed"];
    }

    return ["Confirmed", "Preparing", "Out for Delivery"];
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setActionLoadingId(orderId);

      const token = await AsyncStorage.getItem("token");
      await updateOrderStatusApi(orderId, status, token);

      if (status === "Out for Delivery") {
        const order = orders.find((o) => o._id === orderId);
        const addr = order?.deliveryAddress;
        const deliveryLocation = addr
          ? [addr.addressLine, addr.city].filter(Boolean).join(", ")
          : "";
        Alert.alert("Success", `Order updated to ${status}. Assign a driver next.`);
        router.push({
          pathname: "/create-delivery",
          params: {
            orderId: String(orderId),
            deliveryLocation,
          },
        });
        loadOrders();
        return;
      }

      Alert.alert("Success", `Order updated to ${status}`);
      loadOrders();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdminCancelOrder = (orderId) => {
    Alert.alert("Are you sure you want to cancel this order?", "", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoadingId(orderId);
            const token = await AsyncStorage.getItem("token");
            await adminCancelOrderApi(orderId, token);
            Alert.alert("Success", "Order cancelled.");
            loadOrders();
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to cancel order.");
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const handleDeleteOrder = (orderId) => {
    Alert.alert("Delete Order", "Are you sure you want to delete this cancelled order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoadingId(orderId);

            const token = await AsyncStorage.getItem("token");
            await deleteOrderApi(orderId, token);

            Alert.alert("Success", "Order deleted successfully.");
            loadOrders();
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to delete order.");
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#F59E0B";
      case "Confirmed":
        return "#3B82F6";
      case "Preparing":
        return "#F97316";
      case "Ready for Pickup":
        return "#8B5CF6";
      case "Out for Delivery":
        return "#06B6D4";
      case "Delivered":
        return "#059669";
      case "Completed":
        return "#16A34A";
      case "Cancelled":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  const filters = ["All", "Pending", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Completed", "Cancelled"];

  const filteredOrders =
    selectedFilter === "All"
      ? orders
      : orders.filter((order) => order.status === selectedFilter);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Admin Orders</Text>
        <Text style={styles.subtitle}>Manage customer order statuses</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>There are no orders for this status.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusOptions = getNextStatuses(order);
            const isLoading = actionLoadingId === order._id;

            const isOnlinePaymentPending =
               order.paymentMethod === "online_transfer" &&
               order.paymentStatus !== "Paid";

            const isFinalized = ["Delivered", "Completed", "Cancelled"].includes(
              order.status
            );
            const showAdminCancel = !isFinalized;
            const showActionSection =
              isLoading ||
              !isFinalized ||
              order.status === "Cancelled";

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.headerRow}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(order.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>

                <View style={styles.typeBox}>
                  <Text style={styles.typeLabel}>Order Type</Text>
                  <Text style={styles.typeValue}>
                    {order.orderType === "pickup" ? "Pickup" : "Delivery"}
                  </Text>
                </View>
                 
                <View style={styles.paymentBox}>
                   <Text style={styles.paymentLabel}>Payment</Text>
                   <Text style={styles.paymentText}>
                       {order.paymentMethod === "online_transfer"
                           ? "Online Transfer"
                           : "Cash on Delivery"}{" "}
                           • {order.paymentStatus}
                    </Text>
                 </View>

                <Text style={styles.sectionTitle}>Items</Text>

                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>

                    <Text style={styles.itemPrice}>
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

                {order.customImage ? (
                  <View style={styles.cakeImageBox}>
                    <Text style={styles.cakeImageLabel}>Custom Cake Image</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedImage(getImageUri(order.customImage));
                        setPreviewVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: getImageUri(order.customImage) }}
                        style={styles.cakeImage}
                        resizeMode="cover"
                      />
                      <View style={styles.tapHint}>
                        <Text style={styles.tapHintText}>Tap to expand</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    Rs. {Number(order.totalPrice || 0).toFixed(2)}
                  </Text>
                </View>

                {showActionSection ? (
                  isLoading ? (
                    <ActivityIndicator color="#F97316" style={{ marginTop: 14 }} />
                  ) : (
                    <View style={styles.actionBox}>
                    {!isFinalized ? (
                      <>
                        <Text style={styles.actionTitle}>Update Status</Text>

                        {isOnlinePaymentPending ? (
                          <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                              Waiting for payment verification. Cannot proceed.
                            </Text>
                          </View>
                        ) : (
                          statusOptions.map((status) => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.statusBtn,
                                order.status === status && styles.disabledBtn,
                              ]}
                              disabled={order.status === status}
                              onPress={() => handleUpdateStatus(order._id, status)}
                            >
                              <Text style={styles.statusBtnText}>{status}</Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </>
                    ) : null}

                    {showAdminCancel ? (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleAdminCancelOrder(order._id)}
                      >
                        <Text style={styles.cancelText}>Cancel Order</Text>
                      </TouchableOpacity>
                    ) : null}

                    {order.status === "Cancelled" && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteOrder(order._id)}
                      >
                        <Text style={styles.deleteBtnText}>Delete Order</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  )
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeArea}
            onPress={() => setPreviewVisible(false)}
          >
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
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
    fontSize: 13,
  },
  activeFilterText: {
    color: "#fff",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 15,
    marginBottom: 16,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    maxWidth: 140,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  typeBox: {
    backgroundColor: "#FFF7ED",
    padding: 12,
    borderRadius: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  typeLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  typeValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  itemRow: {
    backgroundColor: "#FFF7ED",
    borderRadius: 15,
    padding: 11,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 14,
    flexWrap: "wrap",
  },
  itemQty: {
    color: "#6B7280",
    marginTop: 3,
    fontWeight: "700",
    fontSize: 12,
  },
  itemPrice: {
    color: "#F97316",
    fontWeight: "900",
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    padding: 11,
    marginTop: 8,
  },
  noteLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  noteText: {
    color: "#111827",
    fontWeight: "700",
    marginTop: 4,
  },
  totalRow: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 13,
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "800",
  },
  totalValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
  actionBox: {
    marginTop: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  statusBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 9,
  },
  disabledBtn: {
    backgroundColor: "#D1D5DB",
  },
  statusBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 5,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "900",
  },
  cancelBtn: {
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
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


  paymentBox: {
  backgroundColor: "#F3F4F6",
  padding: 12,
  borderRadius: 14,
  marginTop: 10,
},

paymentLabel: {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: "800",
},

paymentText: {
  fontSize: 14,
  fontWeight: "900",
  color: "#111827",
  marginTop: 3,
},

warningBox: {
  backgroundColor: "#FEF3C7",
  padding: 12,
  borderRadius: 14,
  marginTop: 10,
},

warningText: {
  color: "#92400E",
  fontWeight: "800",
  fontSize: 13,
},

cakeImageBox: {
  backgroundColor: "#F9FAFB",
  borderRadius: 15,
  padding: 11,
  marginTop: 8,
},

cakeImageLabel: {
  color: "#6B7280",
  fontSize: 12,
  fontWeight: "800",
  marginBottom: 8,
},

cakeImage: {
  width: "100%",
  height: 160,
  borderRadius: 12,
},

tapHint: {
  position: "absolute",
  bottom: 8,
  right: 10,
},

tapHintText: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 11,
  fontWeight: "700",
},

modalContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.95)",
  justifyContent: "center",
  alignItems: "center",
},

fullImage: {
  width: "100%",
  height: "80%",
},

closeArea: {
  position: "absolute",
  top: 50,
  right: 20,
  zIndex: 10,
  backgroundColor: "rgba(255,255,255,0.15)",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
},

closeText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "900",
},
});
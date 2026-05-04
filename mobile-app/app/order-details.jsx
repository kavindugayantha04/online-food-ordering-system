import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderItemCard from "../components/OrderItemCard";
import CakeCustomization from "../components/CakeCustomization";
import UserSidebar from "../components/UserSidebar";
import { createOrderApi } from "../services/orderService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const cartItems = params.cartItems ? JSON.parse(params.cartItems) : [];
  const totalPrice = params.totalPrice ? Number(params.totalPrice) : 0;

  const [orderType, setOrderType] = useState("pickup");
  const [notes, setNotes] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasCake = useMemo(() => {
    return cartItems.some((item) => {
      const category = item.category || item.foodCategory || item.type || "";
      const name = item.foodName || item.name || "";

      return (
        category.toLowerCase().includes("cake") ||
        name.toLowerCase().includes("cake")
      );
    });
  }, [cartItems]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomImage(result.assets[0].uri);
    }
  };

  const prepareOrderItems = () => {
    return cartItems.map((item) => ({
      foodId: item.foodId || item._id || item.id,
      name: item.foodName || item.name,
      price: item.price,
      quantity: item.quantity,
    }));
  };

  const handlePickupOrder = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("items", JSON.stringify(prepareOrderItems()));
      formData.append("totalPrice", String(totalPrice));
      formData.append("orderType", "pickup");
      formData.append("customMessage", hasCake ? customMessage : "");
      formData.append("notes", notes);

      if (customImage) {
        const uriParts = customImage.split("/");
        const filename = uriParts[uriParts.length - 1] || `cake-${Date.now()}.jpg`;
        formData.append("customImage", {
          uri: customImage,
          name: filename,
          type: "image/jpeg",
        });
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Order Failed", data.message || "Something went wrong");
        return;
      }

      await AsyncStorage.removeItem("appliedVoucher");

      Alert.alert("Success", "Order placed successfully");

      router.replace("/my-orders");
    } catch (error) {
      console.log("Place order error:", error);
      Alert.alert("Error", "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

 const handleCheckout = () => {
  const orderData = {
    items: prepareOrderItems(),
    totalPrice,
    orderType: "delivery",
    customMessage: hasCake ? customMessage : "",
    customImage,
    notes,
  };

  router.push({
    pathname: "/address-details",
    params: {
      orderData: JSON.stringify(orderData),
    },
  });
};

  const handleSubmit = () => {
    if (loading) return;

    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items before placing order.");
      return;
    }

    if (orderType === "pickup") {
      handlePickupOrder();
    } else {
      handleCheckout();
    }
  };

  return (
    <View style={styles.pageWrap}>
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        router={router}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.drawerMenuBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Text style={styles.drawerMenuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.title}>Order Details</Text>
            <Text style={styles.subtitle}>
              Review your order before continuing
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>

        {cartItems.map((item, index) => (
          <View key={item.id || item.foodId || index} style={styles.itemCard}>
            <View>
              <Text style={styles.itemName}>
                {item.foodName || item.name}
              </Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>

            <Text style={styles.itemPrice}>
              Rs. {item.price * item.quantity}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Type</Text>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType === "pickup" && styles.activeType,
            ]}
            onPress={() => setOrderType("pickup")}
          >
            <Text
              style={[
                styles.typeText,
                orderType === "pickup" && styles.activeTypeText,
              ]}
            >
              Pickup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType === "delivery" && styles.activeType,
            ]}
            onPress={() => setOrderType("delivery")}
          >
            <Text
              style={[
                styles.typeText,
                orderType === "delivery" && styles.activeTypeText,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasCake && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cake Customization</Text>

          <TextInput
            style={styles.input}
            placeholder="Custom message e.g. Happy Birthday"
            value={customMessage}
            onChangeText={setCustomMessage}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadText}>
              {customImage ? "Change Cake Design Image" : "Upload Cake Design Image"}
            </Text>
          </TouchableOpacity>

          {customImage && (
            <Image source={{ uri: customImage }} style={styles.previewImage} />
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Notes</Text>

        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Add special instructions..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>Rs. {totalPrice}</Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {orderType === "pickup" ? "Place Order" : "Checkout"}
          </Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 18,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  drawerMenuBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  drawerMenuIcon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F97316",
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  headerBackBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  headerBackText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F97316",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  itemQty: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "700",
  },
  itemPrice: {
    color: "#F97316",
    fontWeight: "900",
    fontSize: 16,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  activeType: {
    backgroundColor: "#F97316",
  },
  typeText: {
    fontWeight: "900",
    color: "#374151",
  },
  activeTypeText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "600",
    color: "#111827",
  },
  notesInput: {
    height: 90,
    textAlignVertical: "top",
  },
  uploadButton: {
    marginTop: 12,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontWeight: "900",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginTop: 12,
  },
  totalBox: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#D1D5DB",
    fontWeight: "700",
  },
  totalAmount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  submitButton: {
    backgroundColor: "#F97316",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});
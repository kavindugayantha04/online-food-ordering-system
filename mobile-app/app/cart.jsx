import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  getCart,
  updateCartQuantity,
  removeCartItemApi,
} from "../services/api";

import { applyVoucherApi } from "../services/voucherApi";

import CartItemCard from "../components/CartItemCard";
import CartSummary from "../components/CartSummary";

const VOUCHER_STORAGE_KEY = "appliedVoucher";

export default function Cart() {
  const router = useRouter();

  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherImage, setVoucherImage] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherError, setVoucherError] = useState("");

  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const data = await getCart(token);

      const items = data.items || [];
      const subtotal = data.subtotal || 0;

      setCart({ items, subtotal });

      // Restore previously applied voucher (if any) from AsyncStorage.
      const savedRaw = await AsyncStorage.getItem(VOUCHER_STORAGE_KEY);

      if (savedRaw && items.length > 0) {
        try {
          const saved = JSON.parse(savedRaw);

          if (saved && saved.code) {
            setVoucherCode(saved.code);
            setAppliedVoucher(saved.code);
            setDiscount(saved.discount || 0);
            setFinalTotal(
              typeof saved.finalTotal === "number"
                ? saved.finalTotal
                : subtotal
            );
            setVoucherMessage("Voucher applied successfully.");
            return;
          }
        } catch (parseError) {
          console.log("Failed to parse stored voucher:", parseError.message);
        }
      }

      // Cart is empty: drop any persisted voucher.
      if (items.length === 0) {
        await AsyncStorage.removeItem(VOUCHER_STORAGE_KEY);
      }

      setFinalTotal(subtotal);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const resetVoucher = async (newSubtotal) => {
    setDiscount(0);
    setFinalTotal(newSubtotal || 0);
    setAppliedVoucher("");
    setVoucherMessage("");
    setVoucherError("");

    try {
      await AsyncStorage.removeItem(VOUCHER_STORAGE_KEY);
    } catch (e) {
      console.log("Failed to clear voucher storage:", e.message);
    }
  };

  const increaseQty = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const item = cart.items.find((i) => (i._id || i.id) === id);

      if (!item) return;

      const cartItemId = item._id || item.id;

      const updated = await updateCartQuantity(
        cartItemId,
        item.quantity + 1,
        token
      );

      setCart({
        items: updated.items || [],
        subtotal: updated.subtotal || 0,
      });

      await resetVoucher(updated.subtotal || 0);
    } catch (error) {
      Alert.alert("Error", error.message || "Could not update quantity.");
    }
  };

  const decreaseQty = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const item = cart.items.find((i) => (i._id || i.id) === id);

      if (!item) return;

      if (item.quantity === 1) {
        removeItem(id);
        return;
      }

      const cartItemId = item._id || item.id;

      const updated = await updateCartQuantity(
        cartItemId,
        item.quantity - 1,
        token
      );

      setCart({
        items: updated.items || [],
        subtotal: updated.subtotal || 0,
      });

      await resetVoucher(updated.subtotal || 0);
    } catch (error) {
      Alert.alert("Error", error.message || "Could not update quantity.");
    }
  };

  const removeItem = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const item = cart.items.find((i) => (i._id || i.id) === id);
      const cartItemId = (item && (item._id || item.id)) || id;

      const updated = await removeCartItemApi(cartItemId, token);

      setCart({
        items: updated.items || [],
        subtotal: updated.subtotal || 0,
      });

      await resetVoucher(updated.subtotal || 0);
    } catch (error) {
      Alert.alert("Error", error.message || "Could not remove item.");
    }
  };

  const pickVoucherImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow image access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setVoucherImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not select voucher image.");
    }
  };

  const applyVoucher = async () => {
    try {
      setVoucherError("");
      setVoucherMessage("");

      if (!voucherCode.trim()) {
        setVoucherError("Voucher code is required.");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      setVoucherLoading(true);

      const data = await applyVoucherApi(
        voucherCode,
        cart.subtotal,
        voucherImage,
        token
      );

      const appliedDiscount = data.discount || 0;
      const computedFinal = data.finalTotal || cart.subtotal;
      const code = data.voucherCode || voucherCode.toUpperCase();

      setDiscount(appliedDiscount);
      setFinalTotal(computedFinal);
      setAppliedVoucher(code);
      setVoucherMessage(data.message || "Voucher applied successfully.");

      try {
        await AsyncStorage.setItem(
          VOUCHER_STORAGE_KEY,
          JSON.stringify({
            code,
            discount: appliedDiscount,
            finalTotal: computedFinal,
          })
        );
      } catch (e) {
        console.log("Failed to persist voucher:", e.message);
      }
    } catch (error) {
      setDiscount(0);
      setFinalTotal(cart.subtotal || 0);
      setAppliedVoucher("");
      setVoucherError(error.message || "Invalid voucher code.");

      try {
        await AsyncStorage.removeItem(VOUCHER_STORAGE_KEY);
      } catch (e) {
        console.log("Failed to clear voucher storage:", e.message);
      }
    } finally {
      setVoucherLoading(false);
    }
  };

  const clearVoucher = async () => {
    setVoucherCode("");
    setVoucherImage(null);
    setDiscount(0);
    setFinalTotal(cart.subtotal || 0);
    setAppliedVoucher("");
    setVoucherMessage("");
    setVoucherError("");

    try {
      await AsyncStorage.removeItem(VOUCHER_STORAGE_KEY);
    } catch (e) {
      console.log("Failed to clear voucher storage:", e.message);
    }
  };

  const handlePlaceOrder = () => {
  router.push({
    pathname: "/order-details",
    params: {
      cartItems: JSON.stringify(cart.items),
      totalPrice: displayFinalTotal.toString(),
    },
  });
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.subtotal || 0;
  const displayFinalTotal = finalTotal || totalAmount;

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Cart</Text>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyMain}>Cart is empty</Text>
          <Text style={styles.emptySub}>Add some food from the menu.</Text>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.push("/menu")}
          >
            <Text style={styles.menuBtnText}>Go to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Cart</Text>
      <Text style={styles.subtitle}>Review your selected food items</Text>

      {cart.items.map((item, index) => {
        const itemId = item._id || item.id;

        return (
          <CartItemCard
            key={itemId || `${item.foodName}-${index}`}
            item={{
              ...item,
              id: itemId,
            }}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            onRemove={removeItem}
          />
        );
      })}

      <View style={styles.voucherBox}>
        <Text style={styles.voucherTitle}>Apply Voucher</Text>
        <Text style={styles.voucherSub}>
          Enter a valid voucher code. Voucher image is optional.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter voucher code"
          value={voucherCode}
          onChangeText={setVoucherCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.imageBtn} onPress={pickVoucherImage}>
          <Text style={styles.imageBtnText}>
            {voucherImage ? "Change Voucher Image" : "Upload Voucher Image Optional"}
          </Text>
        </TouchableOpacity>

        {voucherImage && (
          <View style={styles.previewBox}>
            <Image source={{ uri: voucherImage.uri }} style={styles.previewImg} />
            <TouchableOpacity onPress={() => setVoucherImage(null)}>
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {voucherError ? (
          <Text style={styles.errorText}>{voucherError}</Text>
        ) : null}

        {voucherMessage ? (
          <Text style={styles.successText}>
            {voucherMessage} {appliedVoucher ? `(${appliedVoucher})` : ""}
          </Text>
        ) : null}

        <View style={styles.voucherBtnRow}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={applyVoucher}
            disabled={voucherLoading}
          >
            {voucherLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyBtnText}>Apply</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={clearVoucher}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CartSummary
        totalItems={totalItems}
        totalAmount={totalAmount}
        onViewCart={() => {}}
        showButton={false}
      />

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>Rs. {totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount</Text>
          <Text style={styles.discountValue}>- Rs. {discount.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.finalLabel}>Final Total</Text>
          <Text style={styles.finalValue}>
            Rs. {displayFinalTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderText}>Proceed to Order</Text>
      </TouchableOpacity>

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
    padding: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 22,
  },
  voucherBox: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
    marginBottom: 16,
  },
  voucherTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  voucherSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFF7ED",
  },
  imageBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  imageBtnText: {
    color: "#F97316",
    fontWeight: "800",
  },
  previewBox: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImg: {
    width: 130,
    height: 130,
    borderRadius: 14,
    resizeMode: "cover",
  },
  removeImageText: {
    color: "#DC2626",
    marginTop: 8,
    fontWeight: "700",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 10,
    fontWeight: "700",
  },
  successText: {
    color: "#16A34A",
    marginTop: 10,
    fontWeight: "700",
  },
  voucherBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontWeight: "900",
  },
  clearBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  clearBtnText: {
    color: "#374151",
    fontWeight: "900",
  },
  totalBox: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
  },
  totalValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  discountValue: {
    color: "#16A34A",
    fontSize: 15,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  finalLabel: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },
  finalValue: {
    color: "#F97316",
    fontSize: 18,
    fontWeight: "900",
  },
  placeOrderBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 18,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  backBtn: {
    padding: 15,
    marginTop: 8,
    alignItems: "center",
  },
  backText: {
    color: "#6B7280",
    fontWeight: "700",
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
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    padding: 24,
    paddingTop: 75,
  },
  emptyTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 28,
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  emptyMain: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  emptySub: {
    color: "#6B7280",
    marginTop: 8,
    fontSize: 15,
  },
  menuBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginTop: 22,
  },
  menuBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});

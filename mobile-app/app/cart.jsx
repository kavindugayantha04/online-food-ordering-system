import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MenuItemCard from "../components/cart/MenuItemCard";
import CartItemCard from "../components/cart/CartItemCard";
import CartSummary from "../components/cart/CartSummary";
import { getMenuItems } from "../services/menuService";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cartService";
import { applyVoucher as applyVoucherRequest } from "../services/voucherService";

export default function CartScreen() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedNavItem, setSelectedNavItem] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherImage, setVoucherImage] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherMessageType, setVoucherMessageType] = useState("info");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Load local menu data when the screen opens.
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2200);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  const loadInitialData = async () => {
    try {
      const [items] = await Promise.all([getMenuItems(), loadCart()]);
      setMenuItems(items || []);
    } catch (error) {
      Alert.alert("Cart", error?.message || "Could not load menu items.");
    }
  };

  // READ: Load cart items from backend.
  const loadCart = async () => {
    const data = await getCart();
    setCartItems(data.items || []);
    return data;
  };

  // CREATE: Add an item to cart (or increase quantity if it exists).
  const addToCart = async (menuItem) => {
    try {
      const data = await addCartItem({
        foodName: menuItem.foodName,
        image: menuItem.image,
        price: menuItem.price,
        quantity: 1,
      });
      setCartItems(data.items || []);
      setToastType("success");
      setToastMessage(`${menuItem.foodName} added to cart successfully`);
    } catch (error) {
      setToastType("error");
      setToastMessage(`${menuItem.foodName || "Item"} could not be added`);
      Alert.alert("Add Item", error?.response?.data?.message || error?.message);
    }
  };

  // UPDATE: Increase quantity by 1.
  const increaseQuantity = async (itemId) => {
    try {
      const selected = cartItems.find((item) => item.id === itemId);
      if (!selected) return;

      const data = await updateCartItemQuantity(itemId, selected.quantity + 1);
      setCartItems(data.items || []);
    } catch (error) {
      Alert.alert("Update Item", error?.response?.data?.message || error?.message);
    }
  };

  // UPDATE: Decrease quantity by 1 (remove if quantity reaches 0).
  const decreaseQuantity = async (itemId) => {
    try {
      const selected = cartItems.find((item) => item.id === itemId);
      if (!selected) return;

      if (selected.quantity <= 1) {
        const data = await removeCartItem(itemId);
        setCartItems(data.items || []);
        return;
      }

      const data = await updateCartItemQuantity(itemId, selected.quantity - 1);
      setCartItems(data.items || []);
    } catch (error) {
      Alert.alert("Update Item", error?.response?.data?.message || error?.message);
    }
  };

  // DELETE: Remove a cart item completely.
  const removeFromCart = async (itemId) => {
    try {
      const data = await removeCartItem(itemId);
      setCartItems(data.items || []);
    } catch (error) {
      Alert.alert("Remove Item", error?.response?.data?.message || error?.message);
    }
  };

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const totalCartItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const voucherDiscountAmount = useMemo(() => {
    if (!appliedVoucher?.discount || totalCartPrice <= 0) {
      return 0;
    }

    if (appliedVoucher.type === "fixed") {
      return Number(Math.min(appliedVoucher.discount, totalCartPrice).toFixed(2));
    }

    return Number(((totalCartPrice * appliedVoucher.discount) / 100).toFixed(2));
  }, [appliedVoucher, totalCartPrice]);

  const discountedTotal = useMemo(() => {
    return Number(Math.max(totalCartPrice - voucherDiscountAmount, 0).toFixed(2));
  }, [totalCartPrice, voucherDiscountAmount]);

  const filteredMenuItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return menuItems;
    }

    return menuItems.filter((item) => {
      const name = item.foodName?.toLowerCase() || "";
      return name.includes(query);
    });
  }, [menuItems, searchText]);

  const menuImageByFoodName = useMemo(() => {
    return menuItems.reduce((acc, menuItem) => {
      const key = menuItem.foodName?.trim().toLowerCase();
      if (key && menuItem.image) {
        acc[key] = menuItem.image;
      }
      return acc;
    }, {});
  }, [menuItems]);

  const navItems = [
    { label: "Home", icon: "home-outline", route: "/dashboard" },
    { label: "Menu List", icon: "restaurant-outline", route: null },
    { label: "Your Cart", icon: "cart-outline", route: "/cart" },
    { label: "Order", icon: "receipt-outline", route: null },
    { label: "Payment", icon: "card-outline", route: null },
    { label: "Delivery", icon: "bicycle-outline", route: null },
    { label: "Review", icon: "chatbubble-ellipses-outline", route: null },
  ];

  const handleNavPress = (item) => {
    setSelectedNavItem(item.label);
    setIsNavOpen(false);

    if (item.route) {
      router.push(item.route);
      return;
    }

    Alert.alert(item.label, "This module will be connected in the next step.");
  };

  const selectVoucherImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setVoucherImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Voucher Image", "Unable to open image picker.");
    }
  };

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();

    if (!code) {
      setVoucherMessageType("error");
      setVoucherMessage("Please enter a voucher code.");
      return;
    }

    try {
      setIsApplyingVoucher(true);
      const response = await applyVoucherRequest({
        code,
        cartTotal: totalCartPrice,
        voucherImageAsset: voucherImage,
      });

      setAppliedVoucher(response.voucher);
      setVoucherMessageType("success");
      setVoucherMessage(response.message || "Voucher applied successfully.");
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherMessageType("error");
      setVoucherMessage(error?.response?.data?.message || error?.message || "Invalid voucher code.");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isNavOpen && (
        <>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setIsNavOpen(false)} />
          <View style={styles.drawer}>
            <Text style={styles.navTitle}>QuickBite</Text>
            {navItems.map((item) => {
              const isActive = item.label === selectedNavItem;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavPress(item)}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={isActive ? "#111827" : "#4B5563"}
                    style={styles.navIcon}
                  />
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setIsNavOpen(true)}>
            <Ionicons name="menu-outline" size={34} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.heading}>Flavor Fusion</Text>
            <Text style={styles.heroSub}>Select your favorite treats and order with a tap!</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Items</Text>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search food items..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {filteredMenuItems.length === 0 ? (
            <Text style={styles.emptyText}>No menu item found for "{searchText.trim()}".</Text>
          ) : (
            filteredMenuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={addToCart} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cart</Text>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>Your cart is empty. Add some food items.</Text>
          ) : (
            cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={{
                  ...item,
                  image: item.image || menuImageByFoodName[item.foodName?.trim().toLowerCase()],
                }}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))
          )}
          <CartSummary totalAmount={totalCartPrice} totalItems={totalCartItems} />
        </View>

        {cartItems.length > 0 && (
          <>
            <View style={styles.voucherCard}>
              <Text style={styles.voucherTitle}>Apply Voucher</Text>

              <View style={styles.voucherInputWrap}>
                <TextInput
                  style={styles.voucherInput}
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  placeholder="Enter voucher code (e.g., SAVE10)"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={selectVoucherImage}>
                <Ionicons name="cloud-upload-outline" size={16} color="#111827" />
                <Text style={styles.uploadButtonText}>
                  {voucherImage?.uri ? "Change Voucher Image" : "Upload Voucher Image (Optional)"}
                </Text>
              </TouchableOpacity>

              {voucherImage?.uri && <Image source={{ uri: voucherImage.uri }} style={styles.voucherPreview} />}

              <TouchableOpacity
                style={[styles.applyButton, isApplyingVoucher && styles.applyButtonDisabled]}
                onPress={handleApplyVoucher}
                disabled={isApplyingVoucher}
              >
                <Text style={styles.applyButtonText}>
                  {isApplyingVoucher ? "Applying..." : "Apply Voucher"}
                </Text>
              </TouchableOpacity>

              {!!voucherMessage && (
                <Text
                  style={[
                    styles.voucherMessage,
                    voucherMessageType === "success"
                      ? styles.voucherSuccessText
                      : styles.voucherErrorText,
                  ]}
                >
                  {voucherMessage}
                </Text>
              )}

              <View style={styles.voucherTotals}>
                {appliedVoucher?.code && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Applied Voucher</Text>
                    <Text style={styles.totalValue}>
                      {appliedVoucher.code} (
                      {appliedVoucher.type === "fixed"
                        ? `$${appliedVoucher.discount.toFixed(2)} off`
                        : `${appliedVoucher.discount}% off`}
                      )
                    </Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${totalCartPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={styles.discountValue}>-${voucherDiscountAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.totalDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.finalTotalLabel}>Total After Discount</Text>
                  <Text style={styles.finalTotalValue}>${discountedTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.orderButton}
              onPress={() =>
                Alert.alert(
                  "Order",
                  `Order amount: $${discountedTotal.toFixed(
                    2
                  )}. Order action will continue in the Order module.`
                )
              }
            >
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/dashboard")}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>

      {!!toastMessage && (
        <View
          style={[
            styles.toast,
            toastType === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  drawerBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    zIndex: 20,
  },
  drawer: {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: 12,
    width: "72%",
    maxWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    zIndex: 21,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
     
  
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: "#E5E7EB",
  },
  navIcon: {
    marginRight: 10,
  },
  navLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#111827",
    fontWeight: "700",
  },
  hero: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0B1220",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  menuButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#fff",
  },
  heroSub: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#E5E7EB",
    fontWeight: "700",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },
  searchWrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#111827",
    fontSize: 14,
  },
  emptyText: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    color: "#6B7280",
  },
  orderButton: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  voucherCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 12,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  voucherInputWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  voucherInput: {
    height: 42,
    color: "#111827",
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "#111827",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 13,
  },
  voucherPreview: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
  },
  applyButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonDisabled: {
    opacity: 0.65,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  voucherMessage: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  voucherSuccessText: {
    color: "#15803D",
  },
  voucherErrorText: {
    color: "#B91C1C",
  },
  voucherTotals: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "700",
  },
  discountValue: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "700",
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginVertical: 6,
  },
  finalTotalLabel: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  finalTotalValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "800",
  },
  backButton: {
    backgroundColor: "#374151",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  toastSuccess: {
    backgroundColor: "#16A34A",
  },
  toastError: {
    backgroundColor: "#DC2626",
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});

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
} from "react-native";
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

export default function CartScreen() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedNavItem, setSelectedNavItem] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Load local menu data when the screen opens.
  useEffect(() => {
    loadInitialData();
  }, []);

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
    } catch (error) {
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
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))
          )}
          <CartSummary totalAmount={totalCartPrice} totalItems={totalCartItems} />
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => Alert.alert("Order", "Order action will continue in the Order module.")}
          >
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/dashboard")}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
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
});

import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heading}>Flavor Fusion</Text>
          <Text style={styles.heroSub}>Select your favorite treats and order with a tap!</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Items</Text>
          {menuItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={addToCart} />
          ))}
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
            onPress={() =>
              Alert.alert("Order", "Order action will continue in the Order module.")
            }
          >
            <Text style={styles.orderButtonText}>Order</Text>
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
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  heroSub: {
    marginTop: 6,
    fontSize: 13,
    color: "#D1D5DB",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
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

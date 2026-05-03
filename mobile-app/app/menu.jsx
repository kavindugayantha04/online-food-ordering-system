import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MenuItemCard from "../components/MenuItemCard";
import CartSummary from "../components/CartSummary";

import { getFoods, getCart, addToCartApi } from "../services/api";

export default function Menu() {
  const router = useRouter();

  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuAndCart();
  }, []);

  const loadMenuAndCart = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const foodData = await getFoods();
      const cartData = await getCart(token);

      setFoods(foodData);
      setCart({
        items: cartData.items || [],
        subtotal: cartData.subtotal || 0,
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      if (item.availability === false) {
        Alert.alert("Not Available", "This item is not available right now.");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const updatedCart = await addToCartApi(item, token);

      setCart({
        items: updatedCart.items || [],
        subtotal: updatedCart.subtotal || 0,
      });

      Alert.alert("Success", "Item added to cart");
    } catch (error) {
      Alert.alert("Error", error.message || "Could not add item to cart.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  const categories = ["All", ...new Set(foods.map((item) => item.category))];

  const filteredFoods =
    selectedCategory === "All"
      ? foods
      : foods.filter((item) => item.category === selectedCategory);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.subtotal || 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {sidebarOpen && (
        <View style={styles.overlay}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>QuickBite</Text>
            <Text style={styles.sidebarSub}>Customer Menu</Text>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => setSidebarOpen(false)}
            >
              <Text style={styles.sideText}>🍔 Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => {
                setSidebarOpen(false);
                router.push("/cart");
              }}
            >
              <Text style={styles.sideText}>🛒 Cart</Text>
            </TouchableOpacity>

             <TouchableOpacity
                style={styles.sideItem}
                onPress={() => {
                setSidebarOpen(false);
                router.push("/my-orders");
              }}
            >
            <Text style={styles.sideText}>📦 My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutSide} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSidebarOpen(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>QuickBite</Text>
            <Text style={styles.subtitle}>Fresh food, fast delivery</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Hungry?</Text>
          <Text style={styles.heroText}>Choose your favourite meal today</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.activeChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Popular Items</Text>

        {filteredFoods.map((item) => (
          <MenuItemCard
            key={item._id || item.id}
            item={item}
            onAdd={addToCart}
          />
        ))}

        <CartSummary
          totalItems={totalItems}
          totalAmount={totalAmount}
          onViewCart={() => router.push("/cart")}
        />
      </ScrollView>
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
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F97316",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: "#F97316",
    padding: 22,
    borderRadius: 26,
    marginBottom: 20,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  heroText: {
    color: "#FFEDD5",
    marginTop: 6,
    fontSize: 15,
  },
  categoryScroll: {
    marginBottom: 18,
  },
  categoryChip: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
  },
  activeChip: {
    backgroundColor: "#111827",
  },
  categoryText: {
    color: "#6B7280",
    fontWeight: "700",
  },
  activeChipText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sidebar: {
    width: "75%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 65,
  },
  sidebarTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#F97316",
  },
  sidebarSub: {
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 30,
  },
  sideItem: {
    backgroundColor: "#FFF7ED",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sideText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  logoutSide: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
  },
  closeBtn: {
    marginTop: 14,
    padding: 14,
  },
  closeText: {
    color: "#6B7280",
    textAlign: "center",
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
});
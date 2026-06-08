import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";

export default function UserSidebar({
  sidebarOpen,
  setSidebarOpen,
  router,
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  if (!sidebarOpen) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>QuickBite</Text>
        <Text style={styles.sidebarSub}>Customer Menu</Text>

        <TouchableOpacity
          style={styles.sideItem}
          onPress={() => {
            setSidebarOpen(false);
            if (pathname !== "/menu") {
              router.push("/menu");
            }
          }}
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
            router.push("/reviews");
          }}
        >
          <Text style={styles.sideText}>⭐ Reviews</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideItem}
          onPress={() => {
            setSidebarOpen(false);
            router.push("/my-reviews");
          }}
        >
          <Text style={styles.sideText}>📝 My Reviews</Text>
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
  );
}

const styles = StyleSheet.create({
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
});

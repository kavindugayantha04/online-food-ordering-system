import { View, Text, StyleSheet, Image } from "react-native";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const fallbackImage =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38";

export default function OrderItemCard({ item }) {
  const imageUrl = item.image ? `${SERVER_URL}${item.image}` : fallbackImage;

  const name = item.foodName || item.name || "Food Item";
  const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
      </View>

      <Text style={styles.total}>Rs. {itemTotal.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#FED7AA",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  price: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "700",
  },
  quantity: {
    marginTop: 4,
    color: "#374151",
    fontWeight: "800",
  },
  total: {
    color: "#F97316",
    fontWeight: "900",
    fontSize: 15,
  },
});
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const fallbackImage =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38";

export default function CartItemCard({ item, onIncrease, onDecrease, onRemove }) {
  const imageUrl = item.image ? `${SERVER_URL}${item.image}` : fallbackImage;

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.foodName}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        <Text style={styles.total}>Total: Rs. {item.totalPrice}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.qtyBox}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onDecrease(item.id)}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={() => onIncrease(item.id)}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onRemove(item.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    elevation: 3,
  },
  image: {
    width: 85,
    height: 85,
    borderRadius: 18,
    backgroundColor: "#FED7AA",
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  price: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "600",
  },
  total: {
    marginTop: 4,
    color: "#F97316",
    fontWeight: "900",
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  quantity: {
    marginHorizontal: 12,
    fontWeight: "900",
    color: "#111827",
  },
  removeText: {
    color: "#EF4444",
    fontWeight: "800",
  },
});
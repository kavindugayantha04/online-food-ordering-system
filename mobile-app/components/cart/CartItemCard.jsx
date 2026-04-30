import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const fallbackImage =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop";

export default function CartItemCard({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image || fallbackImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.name}>{item.foodName}</Text>
          <Text style={styles.meta}>Unit Price: ${item.price.toFixed(2)}</Text>
          <Text style={styles.total}>Total: ${item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyButton} onPress={() => onDecrease(item.id)}>
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity style={styles.qtyButton} onPress={() => onIncrease(item.id)}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  imageWrap: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  meta: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },
  total: {
    marginTop: 4,
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeText: {
    color: "#D60000",
    fontWeight: "600",
  },
});

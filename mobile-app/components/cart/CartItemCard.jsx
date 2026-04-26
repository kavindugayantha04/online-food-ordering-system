import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CartItemCard({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={styles.itemInfo}>
        <Text style={styles.name}>{item.foodName}</Text>
        <Text style={styles.meta}>Unit Price: ${item.price.toFixed(2)}</Text>
        <Text style={styles.meta}>Total: ${item.totalPrice.toFixed(2)}</Text>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    marginBottom: 10,
  },
  itemInfo: {
    marginBottom: 10,
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

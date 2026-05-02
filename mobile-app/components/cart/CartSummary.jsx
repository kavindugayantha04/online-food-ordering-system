import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function CartSummary({
  totalAmount,
  totalItems,
  onViewCart,
  showButton = true,
}) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.smallText}>Cart Summary</Text>
        <Text style={styles.totalText}>
          {totalItems} items • Rs. {totalAmount}
        </Text>
      </View>

      {showButton && (
        <TouchableOpacity style={styles.button} onPress={onViewCart}>
          <Text style={styles.buttonText}>View Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallText: {
    color: "#D1D5DB",
    fontSize: 13,
  },
  totalText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});

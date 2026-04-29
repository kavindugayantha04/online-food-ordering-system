import { View, Text, StyleSheet } from "react-native";

export default function CartSummary({ totalAmount, totalItems }) {
  return (
    <View style={styles.container}>
      <Text style={styles.summaryText}>Items in Cart: {totalItems}</Text>
      <Text style={styles.summaryText}>Total Price: ${totalAmount.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 14,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9A3412",
    marginBottom: 4,
  },
});

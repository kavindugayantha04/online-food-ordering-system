import { View, Text, StyleSheet } from "react-native";

export default function StatCard({ number, label }) {
  return (
    <View style={styles.card}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginRight: 10,
    elevation: 3,
  },
  number: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F97316",
  },
  label: {
    color: "#666",
  },
});
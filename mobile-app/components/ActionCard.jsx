import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

export default function ActionCard({ title, desc, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  desc: {
    color: "#666",
    marginTop: 4,
  },
  arrow: {
    fontSize: 28,
    color: "#F97316",
  },
});
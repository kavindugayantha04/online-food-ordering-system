import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

const fallbackImage =
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe";

export default function MenuItemCard({ item, onAdd }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image ? `${SERVER_URL}${item.image}` : fallbackImage }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, item.availability === false && styles.disabledBtn]}
        onPress={() => onAdd(item)}
        disabled={item.availability === false}
      >
        <Text style={styles.buttonText}>
          {item.availability === false ? "N/A" : "Add"}
        </Text>
      </TouchableOpacity>
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
    alignItems: "center",
    elevation: 3,
  },
  image: {
    width: 78,
    height: 78,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: "#FED7AA",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  category: {
    marginTop: 5,
    color: "#F97316",
    fontWeight: "600",
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
  },
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  disabledBtn: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
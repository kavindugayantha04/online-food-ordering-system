import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const fallbackImage =
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop";

export default function MenuItemCard({ item, onAdd }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image || fallbackImage }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{item.foodName}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        {!!item.category && <Text style={styles.category}>{item.category}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onAdd(item)}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3E8FF",
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: 12,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  price: {
    marginTop: 3,
    fontSize: 14,
    color: "#374151",
  },
  category: {
    marginTop: 4,
    alignSelf: "flex-start",
    fontSize: 11,
    color: "#6D28D9",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  button: {
    backgroundColor: "#F97316",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

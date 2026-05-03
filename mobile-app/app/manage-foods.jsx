import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFoods, deleteFood } from "../services/api";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

export default function MenuScreen() {
  const router = useRouter();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const data = await getFoods();
      setFoods(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load foods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert("Delete Food", "Are you sure you want to delete this food item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
              Alert.alert("Error", "Please login again.");
              router.replace("/login");
              return;
            }

            await deleteFood(id, token);
            Alert.alert("Success", "Food item deleted");
            loadFoods();
          } catch (error) {
            Alert.alert("Error", error.message || "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading foods...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Foods</Text>
        <Text style={styles.subtitle}>View, edit, or delete menu items</Text>
      </View>

      {foods.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No food items added yet</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-food")}
          >
            <Text style={styles.addBtnText}>Add Food</Text>
          </TouchableOpacity>
        </View>
      ) : (
        foods.map((item) => (
          <View key={item._id} style={styles.card}>
            <Image
              source={{ uri: `${SERVER_URL}${item.image}` }}
              style={styles.foodImage}
            />

            <View style={styles.cardBody}>
              <View style={styles.topRow}>
                <Text style={styles.foodName}>{item.name}</Text>

                <View
                  style={[
                    styles.badge,
                    item.availability ? styles.available : styles.notAvailable,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.availability
                        ? styles.availableText
                        : styles.notAvailableText,
                    ]}
                  >
                    {item.availability ? "Available" : "Not Available"}
                  </Text>
                </View>
              </View>

              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>Rs. {item.price}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/edit-food",
                      params: { id: item._id },
                    })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item._id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 3,
  },
  foodImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#FED7AA",
  },
  cardBody: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  category: {
    marginTop: 4,
    color: "#F97316",
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    color: "#6B7280",
    lineHeight: 20,
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  available: {
    backgroundColor: "#DCFCE7",
  },
  notAvailable: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  availableText: {
    color: "#15803D",
  },
  notAvailableText: {
    color: "#B91C1C",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#F97316",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    marginBottom: 15,
  },
  addBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  backBtn: {
    marginTop: 10,
    padding: 14,
    alignItems: "center",
  },
  backText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
});
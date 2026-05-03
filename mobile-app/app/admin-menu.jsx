import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HeaderCard from "../components/HeaderCard";
import ActionCard from "../components/ActionCard";
import StatCard from "../components/StatCard";
import { getFoods } from "../services/api";

export default function AdminMenu() {
  const router = useRouter();

  const [foodCount, setFoodCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  const loadStats = async () => {
    try {
      const foods = await getFoods();

      setFoodCount(foods.length);

      const categories = [...new Set(foods.map((item) => item.category))];
      setCategoryCount(categories.length);
    } catch (error) {
      console.log("Stats load error:", error.message);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <HeaderCard />

        <View style={styles.row}>
          <StatCard number={foodCount} label="Food Items" />
          <StatCard number={categoryCount} label="Categories" />
        </View>

        <View style={styles.section}>
          <ActionCard
            title="Add Food"
            desc="Create new food item"
            onPress={() => router.push("/add-food")}
          />

          <ActionCard
            title="View Foods"
            desc="Manage menu items"
            onPress={() => router.push("/manage-foods")}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>QuickBite Admin Panel</Text>
      </View>
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
    paddingTop: 50,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
  section: {
    gap: 16,
  },
  footer: {
    marginTop: 30,
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    marginTop: 14,
    color: "#9CA3AF",
    fontSize: 13,
  },
});
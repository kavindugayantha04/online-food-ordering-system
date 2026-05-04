import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ReviewCard from "../components/ReviewCard";
import UserSidebar from "../components/UserSidebar";
import { getAllReviews, deleteReview } from "../services/reviewService";
import { COLORS } from "../constants/colours";

function getUserId(user) {
  if (!user) return null;
  const id = user.id || user._id;
  return id ? String(id) : null;
}

export default function MyReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!userJson || !token) {
        Alert.alert("Login required", "Please log in to see your reviews.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }

      const user = JSON.parse(userJson);

      const data = await getAllReviews();
      const all = data.reviews || [];
      const mine = all.filter((r) => {
        const uid = r.userId?._id || r.userId?.id || r.userId;
        const id = getUserId(user);
        return id && String(uid) === String(id);
      });
      setReviews(mine);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleDelete = (review) => {
    Alert.alert("Delete review?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await deleteReview(review._id, token);
            load();
          } catch (e) {
            Alert.alert("Error", e.message || "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageWrap}>
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        router={router}
      />

      <ScrollView
        style={styles.wrap}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity
            style={styles.drawerMenuBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Text style={styles.drawerMenuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>My Reviews</Text>
            <Text style={styles.subtitle}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/add-review")}
      >
        <Text style={styles.addBtnText}>Add review</Text>
      </TouchableOpacity>

      {reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyText}>
            Share your experience on the reviews page.
          </Text>
        </View>
      ) : (
        reviews.map((r) => (
          <ReviewCard
            key={r._id}
            review={r}
            isOwner
            onEdit={() =>
              router.push({
                pathname: "/edit-review",
                params: { id: String(r._id) },
              })
            }
            onDelete={() => handleDelete(r)}
          />
        ))
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: { flex: 1, backgroundColor: "#FFF7ED" },
  wrap: { flex: 1, backgroundColor: "#FFF7ED" },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  drawerMenuBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  drawerMenuIcon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F97316",
  },
  headerTitles: { flex: 1 },
  content: { padding: 20, paddingTop: 48, paddingBottom: 32 },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, color: COLORS.subtext },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.subtext,
    marginTop: 6,
    marginBottom: 0,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 16,
  },
  empty: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  emptyText: {
    marginTop: 8,
    color: COLORS.subtext,
    textAlign: "center",
  },
});

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
import { getAllReviews, deleteReview } from "../services/reviewService";
import { COLORS } from "../constants/colours";

export default function AdminReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      if (!token || !userJson) {
        router.replace("/login");
        return;
      }
      const user = JSON.parse(userJson);
      if (user.role !== "admin") {
        Alert.alert("Access denied", "Admins only.");
        router.replace("/menu");
        return;
      }

      const data = await getAllReviews();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating ?? 0);
      setTotalReviews(data.totalReviews ?? 0);
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

  const handleAdminDelete = (review) => {
    Alert.alert(
      "Delete this review?",
      "This will permanently remove the review.",
      [
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
      ]
    );
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
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manage Reviews</Text>
      <Text style={styles.subtitle}>Moderate customer feedback</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statBig}>{averageRating.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Average rating</Text>
        <Text style={styles.statMeta}>
          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No reviews to show.</Text>
        </View>
      ) : (
        reviews.map((r) => (
          <ReviewCard
            key={r._id}
            review={r}
            isOwner={false}
            showAdminDelete
            onDelete={() => handleAdminDelete(r)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { padding: 20, paddingTop: 48, paddingBottom: 32 },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, color: COLORS.subtext },
  backBtn: { alignSelf: "flex-start", marginBottom: 12 },
  backText: { color: COLORS.primary, fontWeight: "800", fontSize: 16 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.subtext,
    marginTop: 6,
    marginBottom: 18,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBig: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.primary,
  },
  statLabel: {
    color: COLORS.subtext,
    fontWeight: "700",
    marginTop: 4,
  },
  statMeta: {
    color: COLORS.text,
    fontWeight: "800",
    marginTop: 6,
  },
  empty: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyText: { color: COLORS.subtext, fontWeight: "600" },
});

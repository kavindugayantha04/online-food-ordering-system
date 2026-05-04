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

export default function ReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const data = await getAllReviews();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating ?? 0);
      setTotalReviews(data.totalReviews ?? 0);

      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        try {
          const u = JSON.parse(userJson);
          const id = u.id || u._id;
          setCurrentUserId(id ? String(id) : null);
        } catch {
          setCurrentUserId(null);
        }
      } else {
        setCurrentUserId(null);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
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

  const handleDeleteOwn = (review) => {
    Alert.alert("Delete review?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              router.replace("/login");
              return;
            }
            await deleteReview(review._id, token);
            load();
          } catch (e) {
            Alert.alert("Error", e.message || "Delete failed");
          }
        },
      },
    ]);
  };

  const isOwner = (review) => {
    if (!currentUserId || !review.userId) return false;
    const uid = review.userId._id || review.userId.id || review.userId;
    return String(uid) === String(currentUserId);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reviews…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <UserSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        router={router}
      />

      <ScrollView
        style={styles.container}
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
          <View>
            <Text style={styles.title}>Reviews</Text>
            <Text style={styles.subtitle}>What customers say about QuickBite</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statBig}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average rating</Text>
          <Text style={styles.statMeta}>
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/add-review")}
          >
            <Text style={styles.primaryBtnText}>Write Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/my-reviews")}
          >
            <Text style={styles.secondaryBtnText}>My Reviews</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!error && reviews.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>Be the first to share feedback.</Text>
          </View>
        ) : null}

        {!error &&
          reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              isOwner={isOwner(r)}
              onEdit={
                isOwner(r)
                  ? () =>
                      router.push({
                        pathname: "/edit-review",
                        params: { id: String(r._id) },
                      })
                  : undefined
              }
              onDelete={isOwner(r) ? () => handleDeleteOwn(r) : undefined}
            />
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { flex: 1 },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
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
  content: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, color: COLORS.subtext },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.subtext,
    marginTop: 6,
    marginBottom: 0,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBig: {
    fontSize: 40,
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
  btnRow: {
    gap: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontWeight: "700",
  },
  retryBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  empty: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyText: {
    marginTop: 8,
    color: COLORS.subtext,
    textAlign: "center",
  },
});

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StarRating from "../components/StarRating";
import { getReviewById, updateReview } from "../services/reviewService";
import { COLORS } from "../constants/colours";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

function photoDisplayUri(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
}

export default function EditReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawId = params.id;
  const reviewId = rawId
    ? String(Array.isArray(rawId) ? rawId[0] : rawId)
    : "";

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [existingPhotoPath, setExistingPhotoPath] = useState("");
  const [newPhotoUri, setNewPhotoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!reviewId) {
      Alert.alert("Error", "Missing review.");
      router.back();
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const rev = await getReviewById(reviewId);
        setName(rev.name || "");
        setRating(Number(rev.rating) || 5);
        setComment(rev.comment || "");
        setExistingPhotoPath(rev.photo || "");
      } catch (e) {
        Alert.alert("Error", e.message || "Could not load review");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [reviewId]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "Photo library access is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setNewPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const n = name.trim();
    const c = comment.trim();
    if (!n || !c) {
      Alert.alert("Validation", "Name and comment are required.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Validation", "Invalid rating.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      await updateReview(
        reviewId,
        {
          name: n,
          rating,
          comment: c,
          photo: newPhotoUri || undefined,
        },
        token
      );
      Alert.alert("Success", "Review updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const previewUri = newPhotoUri || photoDisplayUri(existingPhotoPath);

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit review</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={COLORS.subtext}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Rating</Text>
        <StarRating rating={rating} onRatingChange={setRating} size={36} />

        <Text style={styles.label}>Comment</Text>
        <TextInput
          style={[styles.input, styles.commentInput]}
          placeholder="Your comment"
          placeholderTextColor={COLORS.subtext}
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
          <Text style={styles.pickBtnText}>Change photo</Text>
        </TouchableOpacity>

        {previewUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: previewUri }} style={styles.preview} />
            {newPhotoUri ? (
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setNewPhotoUri(null)}
              >
                <Text style={styles.removePhotoText}>Keep original photo</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { alignSelf: "flex-start", marginBottom: 12 },
  backText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  card: {
    margin: 20,
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "#FAFAFA",
  },
  commentInput: { minHeight: 100, textAlignVertical: "top" },
  pickBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  pickBtnText: { color: COLORS.primary, fontWeight: "800" },
  previewBox: { marginTop: 12 },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  removePhoto: { marginTop: 10, alignItems: "center" },
  removePhotoText: { color: COLORS.error, fontWeight: "700" },
  submitBtn: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

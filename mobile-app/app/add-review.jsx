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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StarRating from "../components/StarRating";
import { addReview } from "../services/reviewService";
import { COLORS } from "../constants/colours";

export default function AddReviewScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Login required", "Please log in to write a review.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      }
    })();
  }, []);

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
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const n = name.trim();
    const c = comment.trim();
    if (!n) {
      Alert.alert("Validation", "Please enter your name.");
      return;
    }
    if (!c) {
      Alert.alert("Validation", "Please enter a comment.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Validation", "Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      await addReview(
        { name: n, rating, comment: c, photo: photoUri || undefined },
        token
      );
      Alert.alert("Success", "Thanks for your review!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Write a review</Text>
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
          placeholder="Share your experience..."
          placeholderTextColor={COLORS.subtext}
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <Text style={styles.label}>Photo (optional)</Text>
        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
          <Text style={styles.pickBtnText}>Choose photo</Text>
        </TouchableOpacity>

        {photoUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
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
            <Text style={styles.submitText}>Submit review</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  card: {
    margin: 20,
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    elevation: 2,
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
  commentInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  pickBtnText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  previewBox: {
    marginTop: 12,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  removePhoto: {
    marginTop: 10,
    alignItems: "center",
  },
  removePhotoText: {
    color: COLORS.error,
    fontWeight: "700",
  },
  submitBtn: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFoodById, updateFood } from "../services/api";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL.replace("/api", "");

export default function EditFood() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState(true);
  const [oldImage, setOldImage] = useState("");
  const [newImage, setNewImage] = useState(null);

  const loadFood = async () => {
    try {
      const food = await getFoodById(id);

      setName(food.name);
      setDescription(food.description);
      setPrice(String(food.price));
      setCategory(food.category);
      setAvailability(food.availability);
      setOldImage(food.image);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load food");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFood();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow image access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0]);
    }
  };

  const handleUpdateFood = async () => {
    if (!name.trim() || !description.trim() || !price.trim() || !category.trim()) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("availability", availability ? "true" : "false");

      if (newImage) {
        formData.append("image", {
          uri: newImage.uri,
          name: newImage.fileName || "food.jpg",
          type: newImage.mimeType || "image/jpeg",
        });
      }

      await updateFood(id, formData, token);

      Alert.alert("Success", "Food item updated successfully");
      router.replace("/manage-foods");
    } catch (error) {
      Alert.alert("Error", error.message || "Could not update food item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading food...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Food Item</Text>
      <Text style={styles.subtitle}>Update menu item details</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {newImage ? (
          <Image source={{ uri: newImage.uri }} style={styles.previewImage} />
        ) : oldImage ? (
          <Image source={{ uri: `${SERVER_URL}${oldImage}` }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imageText}>Tap to select food image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Food name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#999"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Category"
        placeholderTextColor="#999"
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchTitle}>Availability</Text>
          <Text style={styles.switchSubtitle}>
            {availability ? "Available for customers" : "Not available now"}
          </Text>
        </View>

        <Switch
          value={availability}
          onValueChange={setAvailability}
          trackColor={{ false: "#FCA5A5", true: "#FDBA74" }}
          thumbColor={availability ? "#F97316" : "#EF4444"}
        />
      </View>

      <TouchableOpacity
        style={[styles.updateBtn, saving && styles.disabledBtn]}
        onPress={handleUpdateFood}
        disabled={saving}
      >
        <Text style={styles.updateBtnText}>
          {saving ? "Updating..." : "Update Food"}
        </Text>
      </TouchableOpacity>

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
    padding: 24,
    paddingTop: 55,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 25,
  },
  imageBox: {
    height: 180,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  imageText: {
    color: "#F97316",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  input: {
    backgroundColor: "#fff",
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FED7AA",
    fontSize: 16,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  switchRow: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 16,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  switchSubtitle: {
    color: "#666",
    marginTop: 4,
  },
  updateBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 5,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  updateBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  backBtn: {
    marginTop: 15,
  },
  backText: {
    color: "#666",
    textAlign: "center",
    fontSize: 15,
  },
  center: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
});
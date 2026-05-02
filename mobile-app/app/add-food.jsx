import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { addFood } from "../services/api";

export default function AddFood() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission Required", "Please allow image access.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],   // ✅ FIXED
    quality: 0.8,
  });

  if (!result.canceled) {
    setImage(result.assets[0]);
  }
};

  const handleAddFood = async () => {
    if (!name.trim() || !description.trim() || !price.trim() || !category.trim()) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }

    if (!image) {
      Alert.alert("Image Required", "Please select a food image.");
      return;
    }

    try {
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
      formData.append("availability", "true");

      formData.append("image", {
        uri: image.uri,
        name: "food.jpg",
        type: "image/jpeg",
      });

      await addFood(formData, token);

      Alert.alert("Success", "Food item added successfully");

      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImage(null);

      router.replace("/admin-menu");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message || "Could not add food item.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Food Item</Text>
      <Text style={styles.subtitle}>Create a new menu item for QuickBite</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
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

      <TouchableOpacity style={styles.addBtn} onPress={handleAddFood}>
        <Text style={styles.addBtnText}>Add Food</Text>
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
  addBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 10,
  },
  addBtnText: {
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
});
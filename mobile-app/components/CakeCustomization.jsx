import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function CakeCustomization({
  customMessage,
  setCustomMessage,
  customImage,
  setCustomImage,
}) {
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCustomImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not select image.");
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cake Customization</Text>

      <Text style={styles.description}>
        Add a cake design image and custom message if needed.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Custom message e.g. Happy Birthday"
        value={customMessage}
        onChangeText={setCustomMessage}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {customImage ? "Change Cake Design Image" : "Upload Cake Design Image"}
        </Text>
      </TouchableOpacity>

      {customImage && (
        <View style={styles.previewBox}>
          <Image source={{ uri: customImage.uri }} style={styles.previewImage} />

          <TouchableOpacity onPress={() => setCustomImage(null)}>
            <Text style={styles.removeText}>Remove Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  description: {
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "600",
    color: "#111827",
  },
  uploadButton: {
    marginTop: 12,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontWeight: "900",
  },
  previewBox: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    resizeMode: "cover",
  },
  removeText: {
    color: "#EF4444",
    fontWeight: "800",
    marginTop: 8,
  },
});
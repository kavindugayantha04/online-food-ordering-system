import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import useDelivery from "../../hooks/useDelivery";

export default function TrackDeliveryDo({ route }) {
  const { delivery, loading, fetchDelivery, updateStatus } = useDelivery();

  // ✅ Get from navigation instead of hardcoding
  // const orderId = "69e31f8f23135b7227d66987";

  const { orderId } = useLocalSearchParams();

  const [updating, setUpdating] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  useEffect(() => {
    fetchDelivery(orderId);
  }, [orderId]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const showFeedback = (text, type = "success") => {
    setFeedback(text);
    setFeedbackType(type);
  };

  const getNextAction = (status) => {
    switch (status) {
      case "Assigned":
        return ["On the way"];
      case "On the way":
        return ["Delivered"];
      default:
        return [];
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      const msg = "Gallery access needed to upload proof image.";
      showFeedback(msg, "error");
      Alert.alert("Permission required", msg);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ✅ updated API
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setProofImage(result.assets[0]);
      showFeedback("Image selected successfully.");
    }
  };

  const buildFormData = async (status) => {
    const formData = new FormData();
    formData.append("status", status);

    if (proofImage) {
      if (Platform.OS === "web") {
        const res = await fetch(proofImage.uri);
        const blob = await res.blob();

        formData.append(
          "proofImage",
          new File([blob], "proof.jpg", {
            type: blob.type || "image/jpeg",
          })
        );
      } else {
        formData.append("proofImage", {
          uri: proofImage.uri,
          name: "proof.jpg",
          type: "image/jpeg",
        });
      }
    }

    return formData;
  };

  const handleUpdate = async (status) => {
    try {
      if (!delivery?._id) return;

      if (status === "Delivered" && !proofImage) {
        const msg = "Proof image is required before marking as Delivered.";
        showFeedback(msg, "error");
        Alert.alert("Error", msg);
        return;
      }

      setUpdating(true);

      const formData = await buildFormData(status);
      await updateStatus(delivery._id, formData);
      await fetchDelivery(orderId);

      setProofImage(null);
      showFeedback(`Status updated to "${status}"`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update status.";

      showFeedback(msg, "error");
      console.log("UPDATE ERROR:", err);
    } finally {
      setUpdating(false);
    }
  };

  // 🔄 Loading State
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // ❌ No data
  if (!delivery) {
    return (
      <View style={styles.center}>
        <Text>No Delivery Found</Text>
      </View>
    );
  }

  const actions = getNextAction(delivery.status);

return (
  <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>🚚 Delivery Panel</Text>

      {!!feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedbackType === "error"
              ? styles.feedbackError
              : styles.feedbackSuccess,
          ]}
        >
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Driver</Text>
        <Text style={styles.value}>{delivery.driverName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>{delivery.status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{delivery.deliveryLocation}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ETA</Text>
        <Text style={styles.value}>{delivery.estimatedTime}</Text>
      </View>

      
      {proofImage && (
        <View style={styles.preview}>
          <Image source={{ uri: proofImage.uri }} style={styles.image} />
          <Text style={styles.previewText}>Image Selected</Text>
        </View>
      )}

      {/* <Text style={styles.section}>Next Action</Text> */}

      {actions.length === 0 ? (
        <Text style={styles.completedText}>🎉 Delivery Completed</Text>
      ) : (
        <>
          {actions.includes("On the way") && (
            <TouchableOpacity
              style={[styles.btn, styles.blueBtn, updating && styles.disabledBtn]}
              onPress={() => handleUpdate("On the way")}
              disabled={updating}
            >
              <Text style={styles.btnText}>📦 Start Delivery</Text>
            </TouchableOpacity>
          )}

        


          {actions.includes("Delivered") && (
            <>
              <Text style={styles.section}>Proof Image</Text>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={pickImage}
                disabled={updating}
              >
                <Text style={styles.btnText}>📷 Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.greenBtn, updating && styles.disabledBtn]}
                onPress={() => handleUpdate("Delivered")}
                disabled={updating}
              >
                <Text style={styles.btnText}>✅ Mark Delivered</Text>
              </TouchableOpacity>
            </>
          )}


          
        </>
      )}


  {delivery?.proofImage && (
        <View style={styles.card}>
          <Text style={styles.label}>📸 Proof Image</Text>
          <Image
            source={{ uri: delivery.proofImage }}
            style={styles.previewImage}
          />
        </View>
      )}

      {updating && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#F97316" />
          <Text style={styles.loadingText}>Updating status...</Text>
        </View>
      )}

    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedbackSuccess: {
    backgroundColor: "#DCFCE7",
  },
  feedbackError: {
    backgroundColor: "#FEE2E2",
  },
  feedbackText: {
    fontWeight: "600",
    color: "#111827",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "gray",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F97316",
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  btn: {
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  blueBtn: {
    backgroundColor: "#3B82F6",
  },
  greenBtn: {
    backgroundColor: "#10B981",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  uploadBtn: {
    backgroundColor: "#6B7280",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
  preview: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  previewText: {
    marginTop: 6,
    color: "#374151",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  completedText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 5,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#6B7280",
  }, previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    marginTop: 10,
  },
});
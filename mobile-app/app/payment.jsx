import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPaymentApi } from "../services/paymentService";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderData = params.orderData ? JSON.parse(params.orderData) : null;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [transactionId, setTransactionId] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [error, setError] = useState("");

  // ---------- FILE PICK ----------
  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "image/webp"],
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setReceiptImage({
        uri: asset.uri,
        name: asset.name || `receipt-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      });
      setError("");
    }
  };

  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split("/");
      const defaultName = uriParts[uriParts.length - 1] || "receipt.jpg";

      setReceiptImage({
        uri: asset.uri,
        name: asset.fileName || defaultName,
        mimeType: asset.mimeType || "image/jpeg",
      });
      setError("");
    }
  };

  const showUploadOptions = () => {
    Alert.alert("Upload Receipt", "Choose source", [
      { text: "Gallery", onPress: handlePickImage },
      { text: "Files", onPress: handlePickDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ---------- VALIDATION ----------
  const validateForm = () => {
    if (!orderData) {
      setError("Order details missing");
      return false;
    }

    if (paymentMethod === "online_transfer") {
      if (!transactionId.trim()) {
        setError("Enter transaction ID");
        return false;
      }
      if (!receiptImage) {
        setError("Upload payment receipt");
        return false;
      }
    }
    return true;
  };

  // ---------- SUBMIT ----------
  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("token");

      const paymentStatus =
        paymentMethod === "cash_on_delivery"
          ? "COD Pending"
          : "Waiting for Verification";

      const finalOrderData = {
        ...orderData,
        notes:
          paymentMethod === "online_transfer" && transactionId
            ? orderData.notes
              ? `${orderData.notes} | TXN: ${transactionId}`
              : `TXN: ${transactionId}`
            : orderData.notes || "",
      };

      await createPaymentApi(
        {
          orderData: finalOrderData,
          paymentMethod,
          paymentStatus,
          transactionId,
          receiptImage:
            paymentMethod === "online_transfer" ? receiptImage : null,
        },
        token
      );

      try {
        await AsyncStorage.removeItem("appliedVoucher");
      } catch (e) {
        console.log("Clear voucher error:", e?.message);
      }

      Alert.alert(
        "Success",
        paymentMethod === "cash_on_delivery"
          ? "Order placed (Pay on delivery)"
          : "Payment submitted. Waiting for verification"
      );

      router.replace("/my-orders");
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Complete your payment</Text>

      {/* TOTAL */}
      {orderData?.totalPrice ? (
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            Rs. {Number(orderData.totalPrice).toFixed(2)}
          </Text>
        </View>
      ) : null}

      {/* PAYMENT METHOD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              paymentMethod === "cash_on_delivery" &&
                styles.methodButtonActive,
            ]}
            onPress={() => setPaymentMethod("cash_on_delivery")}
          >
            <Text
              style={[
                styles.methodText,
                paymentMethod === "cash_on_delivery" &&
                  styles.methodTextActive,
              ]}
            >
              Cash on Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              paymentMethod === "online_transfer" &&
                styles.methodButtonActive,
            ]}
            onPress={() => setPaymentMethod("online_transfer")}
          >
            <Text
              style={[
                styles.methodText,
                paymentMethod === "online_transfer" &&
                  styles.methodTextActive,
              ]}
            >
              Online Transfer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ONLINE PAYMENT UI */}
      {paymentMethod === "online_transfer" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <View style={styles.bankBox}>
            <Text style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank: </Text>Commercial Bank
            </Text>
            <Text style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account: </Text>1234567890
            </Text>
            <Text style={styles.bankRow}>
              <Text style={styles.bankLabel}>Name: </Text>QuickBite (Pvt) Ltd
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Transaction ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter transaction reference"
            value={transactionId}
            onChangeText={setTransactionId}
          />

          <Text style={styles.fieldLabel}>Payment Receipt</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showUploadOptions}
          >
            <Text style={styles.uploadText}>
              {receiptImage ? "Change Receipt" : "Upload Receipt"}
            </Text>
          </TouchableOpacity>

          {receiptImage?.uri && (
            <Image
              source={{ uri: receiptImage.uri }}
              style={styles.receiptPreview}
              resizeMode="cover"
            />
          )}
        </View>
      )}

      {/* COD INFO */}
      {paymentMethod === "cash_on_delivery" && (
        <View style={styles.section}>
          <Text style={styles.codInfo}>
            You will pay in cash when your order is delivered.
          </Text>
        </View>
      )}

      {/* ERROR */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>
            {paymentMethod === "cash_on_delivery"
              ? "Place Order"
              : "Submit Payment"}
          </Text>
        )}
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
    padding: 18,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },
  backText: {
    color: "#F97316",
    fontWeight: "900",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 18,
    fontWeight: "600",
  },
  totalBox: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#D1D5DB",
    fontWeight: "700",
    fontSize: 13,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: "#F97316",
  },
  methodText: {
    color: "#374151",
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },
  methodTextActive: {
    color: "#fff",
  },
  bankBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  bankRow: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  bankLabel: {
    color: "#6B7280",
    fontWeight: "800",
  },
  fieldLabel: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "600",
    color: "#111827",
  },
  uploadButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontWeight: "900",
  },
  receiptPreview: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    marginTop: 12,
    backgroundColor: "#F3F4F6",
  },
  codInfo: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});

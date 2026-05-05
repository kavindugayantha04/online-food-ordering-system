import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AddressDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderData = params.orderData
    ? JSON.parse(params.orderData)
    : null;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");

  const handleNext = () => {
    if (!fullName || !phone || !addressLine || !city) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    const address = {
      fullName,
      phone,
      addressLine,
      city,
    };

    router.push({
      pathname: "/payment",
      params: {
        orderData: JSON.stringify({
          ...orderData,
          deliveryAddress: address,
        }),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Delivery Address</Text>
      <Text style={styles.subtitle}>
        Enter your delivery details
      </Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Address */}
      <TextInput
        style={styles.input}
        placeholder="Address Line"
        value={addressLine}
        onChangeText={setAddressLine}
      />

      {/* City */}
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Continue to Payment</Text>
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
    padding: 20,
    paddingTop: 50,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 16,
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
    marginTop: 6,
    marginBottom: 20,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#F97316",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
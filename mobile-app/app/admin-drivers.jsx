import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDriverApi } from "../services/api";

export default function AdminDriversScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert("Missing Name", "Please enter driver name.");
      return;
    }

    if (trimmedName.length < 3) {
      Alert.alert("Invalid Name", "Name must be at least 3 characters.");
      return;
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      Alert.alert("Invalid Name", "Name must contain only letters.");
      return;
    }

    if (!trimmedEmail) {
      Alert.alert("Missing Email", "Please enter driver email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      Alert.alert("Missing Password", "Please enter password.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters and contain letters and numbers."
      );
      return;
    }

    if (trimmedPhone && !/^[0-9]{10}$/.test(trimmedPhone)) {
      Alert.alert("Invalid Phone", "Phone number must contain 10 digits.");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login again.");
        router.replace("/login");
        return;
      }

      await createDriverApi(
        {
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          phone: trimmedPhone,
        },
        token
      );

      Alert.alert("Success", "Driver account created.");

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not create driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manage Drivers</Text>

      <Text style={styles.sub}>
        Drivers log in from the same QuickBite login screen and use the driver
        dashboard.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Create driver account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 20,
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
  },
  backText: {
    color: "#F97316",
    fontWeight: "800",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  sub: {
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
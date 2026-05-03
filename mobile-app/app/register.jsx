import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.9:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Register Failed", data.message || "Something went wrong.");
        return;
      }

      Alert.alert("Success", "Registered successfully");
      router.push("/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join QuickBite today</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.registerText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  registerBtn: {
    width: "100%",
    backgroundColor: "#F97316",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 5,
    marginBottom: 20,
  },
  registerText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#F97316",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 15,
  },
  backText: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
  },
});
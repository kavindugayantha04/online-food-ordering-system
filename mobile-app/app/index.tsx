import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
          }}
          style={styles.foodImage}
        />
      </View>

      <View style={styles.bottomCard}>
        <Text style={styles.title}>
          Quick<Text style={styles.highlight}>Bite</Text>
        </Text>

        <Text style={styles.subtitle}>Delicious food made just for you</Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F97316",
  },
  topSection: {
    flex: 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: "#fff",
  },
  bottomCard: {
    flex: 0.55,
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
  },
  highlight: {
    color: "#F97316",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#F97316",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  registerBtn: {
    width: "100%",
    backgroundColor: "#FFEDE5",
    padding: 15,
    borderRadius: 15,
  },
  registerText: {
    color: "#F97316",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
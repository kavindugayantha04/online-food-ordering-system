import { View, Text, StyleSheet } from "react-native";

export default function HeaderCard() {
  return (
    <View style={styles.header}>
      <Text style={styles.welcome}>Welcome Admin 👋</Text>
      <Text style={styles.title}>QuickBite Dashboard</Text>
      <Text style={styles.subtitle}>Manage food items easily</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F97316",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  welcome: {
    color: "#FFEDD5",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#FFEDD5",
    marginTop: 6,
  },
});
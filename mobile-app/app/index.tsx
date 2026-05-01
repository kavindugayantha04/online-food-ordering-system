import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from "expo-router";

export default function Index() {

  const router = useRouter(); // ✅ meka add karanna

  return (
    <View style={styles.container}>
      <Text style={styles.text}>QuickBite 🚀</Text>
      
      <Button
        title="Customer Track Delivery"
        onPress={() => router.push("/TrackDelivery")}
      />

      <Button
        title="Driver Track Delivery"
        onPress={() => router.push("/DeliveryOfficer/home")}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  }
});

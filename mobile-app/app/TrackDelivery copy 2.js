// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";

// import useDelivery from "../hooks/useDelivery";

// export default function TrackDelivery() {
//   const { delivery, loading, fetchDelivery } = useDelivery();

//   const orderId = "69e31f8f23135b7227d66987";

//   useEffect(() => {
//     fetchDelivery(orderId);
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#F97316" />
//         <Text style={styles.loadingText}>Tracking your delivery...</Text>
//       </View>
//     );
//   }

//   if (!delivery) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>No Delivery Found 😕</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <Text style={styles.title}>🚚 Track Delivery</Text>

//       {/* Driver Card */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Driver</Text>
//         <Text style={styles.value}>{delivery.driverName}</Text>
//       </View>

//       {/* Status Card */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Status</Text>
//         <Text style={[styles.value, styles.status]}>
//           {delivery.status}
//         </Text>
//       </View>

//       {/* ETA Card */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Estimated Time</Text>
//         <Text style={styles.value}>{delivery.estimatedTime} ( {new Date(delivery.deliveredAt).toLocaleString()} )</Text>
//       </View>

//       {/* Delivered Time */}
//       {/* {delivery.deliveredAt && (
//         <View style={[styles.card, styles.successCard]}>
//           <Text style={styles.label}>Delivered At</Text>
//           <Text style={styles.value}>
//             {new Date(delivery.deliveredAt).toLocaleString()}
//           </Text>
//         </View>
//       )} */}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     padding: 20,
//   },

//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#111827",
//   },

//   loadingText: {
//     marginTop: 10,
//     color: "#6B7280",
//   },

//   errorText: {
//     fontSize: 16,
//     color: "red",
//   },

//   card: {
//     backgroundColor: "white",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 3,
//   },

//   label: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginBottom: 5,
//   },

//   value: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#111827",
//   },

//   status: {
//     color: "#F97316",
//   },

//   successCard: {
//     borderLeftWidth: 5,
//     borderLeftColor: "green",
//   },
// });
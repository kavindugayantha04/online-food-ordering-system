// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
// } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import useDelivery from "../hooks/useDelivery";

// export default function TrackDelivery() {
//   const { delivery, loading, fetchDelivery } = useDelivery();

//   const orderId = "69e31f8f23135b7227d66987";

//   const [mapVisible, setMapVisible] = useState(false);
//   const [coords, setCoords] = useState({
//     latitude: 6.9271,
//     longitude: 79.8612,
//   });
//   const [address, setAddress] = useState("");

//   useEffect(() => {
//     fetchDelivery(orderId);
//   }, []);

//   // 🌍 Open map + get current location
//   const openMap = async () => {
//     setMapVisible(true);

//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") return;

//     const loc = await Location.getCurrentPositionAsync({});
//     const { latitude, longitude } = loc.coords;

//     setCoords({ latitude, longitude });

//     const geo = await Location.reverseGeocodeAsync({
//       latitude,
//       longitude,
//     });

//     if (geo.length > 0) {
//       const g = geo[0];
//       setAddress(
//         `${g.street || ""} ${g.city || ""} ${g.country || ""}`
//       );
//     }
//   };

//   const saveAddress = () => {
//     setMapVisible(false);
//   };

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
      
//       <Text style={styles.title}>🚚 Track Delivery</Text>

//       {/* DRIVER CARD */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Driver</Text>
//         <Text style={styles.value}>{delivery.driverName}</Text>
//       </View>

//       {/* STATUS CARD */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Status</Text>
//         <Text style={[styles.value, styles.status]}>
//           {delivery.status}
//         </Text>
//       </View>

//       {/* ADDRESS CARD */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Delivery Address</Text>
//         <Text style={styles.value}>
//           {address || "No address set"}
//         </Text>

//         <TouchableOpacity style={styles.btn} onPress={openMap}>
//           <Text style={styles.btnText}>📍 Set / Edit Address</Text>
//         </TouchableOpacity>
//       </View>

//       {/* MAP MODAL */}
//       <Modal visible={mapVisible} animationType="slide">
//         <View style={{ flex: 1 }}>

//           <MapView
//             style={{ flex: 1 }}
//             region={{
//               ...coords,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//             onPress={(e) => setCoords(e.nativeEvent.coordinate)}
//           >
//             <Marker
//               coordinate={coords}
//               draggable
//               onDragEnd={(e) => setCoords(e.nativeEvent.coordinate)}
//             />
//           </MapView>

//           <View style={styles.mapPanel}>
//             <TextInput
//               value={address}
//               onChangeText={setAddress}
//               placeholder="Edit address"
//               style={styles.input}
//             />

//             <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
//               <Text style={{ color: "white", fontWeight: "bold" }}>
//                 Save Address
//               </Text>
//             </TouchableOpacity>
//           </View>

//         </View>
//       </Modal>

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

//   btn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   btnText: {
//     color: "white",
//     fontWeight: "bold",
//   },

//   mapPanel: {
//     padding: 15,
//     backgroundColor: "white",
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//   },

//   saveBtn: {
//     backgroundColor: "#10B981",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });
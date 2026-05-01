import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router"; // ✅ FIXED
import { BASE_URL } from "../../constants/config";

export default function DeliveryListPage() {
  const router = useRouter(); // ✅ FIXED

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/delivery`);
      const data = await res.json();

      if (res.ok) {
        setDeliveries(Array.isArray(data) ? data : data?.deliveries || []);
      } else {
        Alert.alert("Error", data?.message || "Failed to load deliveries");
      }
    } catch (err) {
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>

      <Text style={styles.cell}>{item.deliveryLocation}</Text>

      <Text style={[styles.cell, styles.status]}>
        {item.status}
      </Text>

      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() =>
          router.push({
            pathname: "/DeliveryOfficer/TrackDelivery",
            params: { orderId: item.orderId },
          })
        }
      >
        <Text style={styles.viewBtnText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 10 }}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Delivery List</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>#</Text>
        <Text style={styles.headerCell}>Location</Text>
        <Text style={styles.headerCell}>Status</Text>
        <Text style={styles.headerCell}>Action</Text>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item._id?.toString() || item.orderId}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No deliveries found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#111827",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#111827",
        paddingVertical: 12,
        paddingHorizontal: 8,
        // borderRadius: 10,
        marginBottom: 8,
    },
    headerCell: {
        flex: 1,
        color: "white",
        fontWeight: "700",
        fontSize: 12,
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 8,
        alignItems: "center",
    },
    cell: {
        flex: 1,
        fontSize: 12,
        color: "#111827",
        paddingHorizontal: 4,
    },
    status: {
        fontWeight: "700",
        color: "#F97316",
    },
    viewBtn: {
        backgroundColor: "#3B82F6",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    viewBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 12,
    },
    emptyBox: {
        padding: 30,
        alignItems: "center",
    },
    emptyText: {
        color: "#6B7280",
    },
});
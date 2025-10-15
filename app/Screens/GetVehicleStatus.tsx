import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { router } from "expo-router";

const Api_base_url = process.env.EXPO_PUBLIC_BASE_URL;

interface VehicleStatus {
  regno: string;
  gatepass: string;
}

export default function GetVehicleStatus() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatApiDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const formattedDate = formatApiDate(selectedDate);
      const url = `${Api_base_url}/SampleStatus/GetVehicle/${formattedDate}`;

      const response = await axios.get<VehicleStatus[]>(url);

      setVehicleData(response.data);
    } catch (err: any) {
      console.error("❌ API Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Status Filter</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          themeVariant="light"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Loading / Error / Data */}
      <View style={{ marginTop: 20 }}>
        {loading && <ActivityIndicator size="large" color="#007AFF" />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && vehicleData.length > 0 ? (
          <FlatList
            data={vehicleData}
            keyExtractor={(item) => item.gatepass}
            renderItem={({ item }) => (
              <Card style={styles.card} onPress={() =>
                router.push({
                  pathname: '/Screens/VehicleDetails', 
                  params: { regno: item.regno }
                })
              }>
                <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar.Icon
                    size={44}
                    icon="car"        // You can change this to "car-outline", "truck", etc.
                    color="#fff"
                    style={styles.avatar}
                   />
                  <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>Reg. No: {item.regno}</Text>
                    <Text style={styles.itemSubtitle}>Gatepass: {item.gatepass}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        ) : (
          !loading &&
          !error && (
            <Text style={styles.noData}>No vehicles found for this date.</Text>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f5f7",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#043b76ff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#043b76ff",
    fontWeight: "600",
  },
  card: {
    marginVertical: 6,
    borderRadius: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  noData: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginTop: 30,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "600",
  },
  avatar: {
    backgroundColor: "#0c57a7ff",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
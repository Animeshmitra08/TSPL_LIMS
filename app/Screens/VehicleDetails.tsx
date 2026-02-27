import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

const Api_base_url = process.env.EXPO_PUBLIC_BASE_URL;

interface VehicleDetails {
  regno: string;
  sM_RESULT: string;
  arB_TM: string;
  arB_VM: string;
  status: string;
}

export default function VehicleDetailsScreen() {
  const { regno } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${Api_base_url}/SampleStatus/GetVehicle/Status/${regno}`;
      const response = await axios.get<VehicleDetails>(url);

      setVehicle(response.data);
    } catch (error: any) {
      const err = error.response.data.Data.ErrorInfo;
      console.error('Login error:', err);
      setError(`${err.Key} : ${err.Message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (regno) {
      fetchVehicleData();
    }
  }, [regno]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading vehicle details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text>No vehicle details found.</Text>
      </View>
    );
  }

  return (
    <>
    <Stack.Screen
      options={{
        title: "Vehicle Details",
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerStyle: {
          backgroundColor: "#193b86ff",
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },
        headerBackTitle: "back",
      }}
    />
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={`Reg. No: ${vehicle.regno}`}
          subtitle={`Status: ${vehicle.status || "N/A"}`}
          left={(props) => <Avatar.Icon {...props} icon="car" />}
          />
        <Card.Content>
          {/* <Text style={styles.text}>Reg. No. : {vehicle.regno || "N/A"}</Text> */}
          {/* <Text style={styles.text}>Result : {vehicle.sM_RESULT || "N/A"}</Text> */}
          <Text style={styles.text}>ARB_TM : {vehicle.arB_TM || "N/A"}</Text>
          <Text style={styles.text}>ARB_VM : {vehicle.arB_VM || "N/A"}</Text>
          {/* <Text style={styles.text}>Status : {vehicle.status || "N/A"}</Text> */}
        </Card.Content>
      </Card>
    </View>
    <StatusBar style={"light"} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },
  card: { padding: 10, borderRadius: 10 },  
  text: { fontSize: 16, marginVertical: 4, fontWeight: "500" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { DrawerParamList } from "../(drawer)/DrawerNavigator";
import { StatusBar } from "expo-status-bar";

type Props = DrawerScreenProps<DrawerParamList, "Home">;

const LandingScreen = ({ navigation }: Props) => {
  return (
    <>
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/tspl-logo.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome to TSPL LIMS</Text>

      {/* Coal Sampling */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Button
            mode="contained"
            icon="fire"
            style={[styles.button]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate("Coal Sampling")}
          >
            Coal Sampling
          </Button>
        </Card.Content>
      </Card>

      {/* Biomass Sampling */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Button
            mode="contained"
            icon="leaf"
            style={[styles.button, { backgroundColor: "#FF5722" }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate("Biomass Sampling")}
          >
            Biomass Sampling
          </Button>
        </Card.Content>
      </Card>
    </View>    
    <StatusBar style="light"/>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f2f6fa",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 80,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    marginBottom: 30,
    fontWeight: "700",
    color: "#333",
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    backgroundColor: "#fff",
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default LandingScreen;
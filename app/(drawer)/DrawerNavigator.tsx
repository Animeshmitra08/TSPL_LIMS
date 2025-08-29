import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { Alert, StyleSheet, useColorScheme, View } from 'react-native';
import { Avatar, Button, Divider, Text } from 'react-native-paper';
import HomeScreen from '../Screens/Home';
import RakeSampleForm from '../Screens/RakeSampleform';
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import LandingScreen from '../Screens/Landing';
import { useAuth } from '@/context/AuthContext';

type DrawerNavigatorProps = {
  onLogout: () => Promise<void>;
};


export type DrawerParamList = {
  Home: undefined;
  "Biomass Sampling": undefined;
  "Coal Sampling": undefined;
};


const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator({ onLogout }: DrawerNavigatorProps) {

  let colorScheme = useColorScheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerHideStatusBarOnOpen: true,
        drawerStyle: {
          backgroundColor: colorScheme ==="dark" ? "#292828" : "#fff",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          overflow: "hidden",
        },
      }}
      drawerContent={(props) => (
        <CustomDrawer {...props} onLogout={onLogout} />
      )}
    >
      <Drawer.Screen 
        name="Home"
        component={LandingScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#276dbdff", "#193b86ff"]}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />


      <Drawer.Screen
        name="Coal Sampling"
        component={RakeSampleForm}
        options={{
          drawerIcon: ({ color, size }) => (
            // <MaterialIcons name="fire" size={size} color={color} />
            <FontAwesome5 name="fire" size={size} color={color} />
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#276dbdff", "#193b86ff"]}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />


      <Drawer.Screen
        name="Biomass Sampling"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="eco" size={size} color={color} />
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#ec905bff", "#eb6a2eff"]}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />      
    </Drawer.Navigator>
  );
}

async function handleLogout(onLogout: () => Promise<void>) {
  Alert.alert("Are you sure You want to Logout", "This action will throw you for login", [
    {
      text: "cancel",
      onPress: () => { }
    },
    {
      text: "Yes",
      onPress: async () => {
        await onLogout();
      }
    }
  ]);
}

function CustomDrawer(props: any) {

  const { user, logout } = useAuth();
  let colorScheme = useColorScheme();

  return (
    <DrawerContentScrollView {...props}>
      <View 
      style={styles.header}
      >
        <Avatar.Icon icon="account" size={48} style={{ backgroundColor: "blue" }} />
        <Text style={[styles.username, {color: colorScheme === "dark" ? "#fff" : "#000"}]}>Welcome</Text>
        <Text style={[styles.username, {color: colorScheme === "dark" ? "#fff" : "#000"}]}>{user?.fullname}</Text>
      </View>
      <Divider style={{ marginVertical: 8 }} />
      <DrawerItemList  {...props} />
      <Divider style={{ marginVertical: 8 }} />
      <Button
        icon="logout"
        mode="outlined"
        labelStyle={{ color: colorScheme === "dark" ? "#fff" : "#000" }}
        onPress={async () => {
          await handleLogout(logout)
        }}
        style={[styles.logout, {borderColor: colorScheme === "dark" ? "#fff" : "#000"}]}
      >
        Logout
      </Button>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  username: {
    marginTop: 8,
    fontWeight: "bold",
    // color: "white", 
    fontSize: 16,
  },
  logout: {
    margin: 16,
  },
});

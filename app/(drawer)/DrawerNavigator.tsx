import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { Alert, Dimensions, StyleSheet, useColorScheme, View } from 'react-native';
import { Avatar, Button, Divider, Surface, Text } from 'react-native-paper';
import HomeScreen from '../Screens/Home';
import RakeSampleForm from '../Screens/RakeSampleform';
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import LandingScreen from '../Screens/Landing';
import { useAuth } from '@/context/AuthContext';
import GetVehicleStatus from '../Screens/GetVehicleStatus';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const { width } = Dimensions.get('window');

type DrawerNavigatorProps = {
  onLogout: () => Promise<void>;
};


export type DrawerParamList = {
  Home: undefined;
  "Biomass Sampling": undefined;
  "Coal Sampling": undefined;
  "Vehicle Status": undefined;
};


const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator({ onLogout }: DrawerNavigatorProps) {

  let colorScheme = useColorScheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerHideStatusBarOnOpen: false,
        drawerStyle: {
          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f8f9fa",
          borderTopRightRadius: 25,
          borderBottomRightRadius: 25,
          overflow: "hidden",
          width: width * 0.85,
          shadowColor: "#000",
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 10,
        },
        drawerActiveTintColor: colorScheme === "dark" ? "#4fc3f7" : "#1976d2",
        drawerInactiveTintColor: colorScheme === "dark" ? "#b0b0b0" : "#666",
        drawerItemStyle: {
          marginHorizontal: 12,
          marginVertical: 4,
          borderRadius: 12,
          paddingHorizontal: 8,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -8,
        },
        drawerActiveBackgroundColor: colorScheme === "dark" ? "#2d5a87" : "#e3f2fd",
      }}
      drawerContent={(props) => (
        <CustomDrawer {...props} onLogout={onLogout} />
      )}
    >
      <Drawer.Screen 
        name="Home"
        component={LandingScreen}
        options={{
          drawerIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <MaterialIcons name="home" size={size + 2} color={color} />
            </View>
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#193b86ff", "#276dbdff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { 
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: 0.5,
          },
          headerShadowVisible: true,
        }}
      />

      <Drawer.Screen
        name="Coal Sampling"
        component={RakeSampleForm}
        options={{
          drawerIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <FontAwesome5 name="fire" size={size + 1} color={color} />
            </View>
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#193b86ff", "#276dbdff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { 
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: 0.5,
          },
          headerShadowVisible: true,
        }}
      />

      <Drawer.Screen
        name="Biomass Sampling"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <MaterialIcons name="eco" size={size + 2} color={color} />
            </View>
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#eb6a2eff", "#ec905bff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { 
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: 0.5,
          },
          headerShadowVisible: true,
        }}
      />      

      <Drawer.Screen
        name="Vehicle Status"
        component={GetVehicleStatus}
        options={{
          drawerIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
              <MaterialDesignIcons name="car-info" size={size + 2} color={color} />
            </View>
          ),
          headerBackground: () => (
            <LinearGradient
              colors={["#193b86ff", "#ec905bff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: { 
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: 0.5,
          },
          headerShadowVisible: true,
        }}
      /> 
    </Drawer.Navigator>
  );
}

async function handleLogout(onLogout: () => Promise<void>) {
  Alert.alert(
    "Logout Confirmation", 
    "Are you sure you want to logout? This will redirect you to the login screen.", 
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => { }
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await onLogout();
        }
      }
    ],
    { cancelable: true }
  );
}

function CustomDrawer(props: any) {
  const { user, logout } = useAuth();
  let colorScheme = useColorScheme();

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={styles.drawerContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Header Section */}
      <Surface style={[styles.headerSurface, {
        backgroundColor: colorScheme === "dark" ? "#2d2d2d" : "#ffffff"
      }]} elevation={2}>
        <LinearGradient
          colors={colorScheme === "dark" 
            ? ["#1e3a8a", "#1e40af"] 
            : ["#3b82f6", "#1d4ed8"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              label={getInitials(user?.emailid || "")} 
              size={68} 
              style={styles.avatar}
              labelStyle={styles.avatarText}
            />
            <View style={styles.statusIndicator} />
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.emailText} numberOfLines={1}>
              {user?.emailid || "Guest User"}
            </Text>
          </View>
        </LinearGradient>
      </Surface>

      {/* Navigation Items */}
      <View style={styles.navigationSection}>
        <Text style={[styles.sectionTitle, {
          color: colorScheme === "dark" ? "#b0b0b0" : "#666"
        }]}>
          NAVIGATION
        </Text>
        <DrawerItemList {...props} />
      </View>

      {/* Enhanced Logout Button */}
      <View style={styles.logoutSection}>
        <Divider style={[styles.divider, {
          backgroundColor: colorScheme === "dark" ? "#404040" : "#e0e0e0"
        }]} />
        
        <Surface style={[styles.logoutButtonSurface, {
          backgroundColor: colorScheme === "dark" ? "#2d2d2d" : "#ffffff"
        }]} elevation={1}>
          <Button
            icon="logout"
            mode="contained"
            buttonColor={colorScheme === "dark" ? "#d32f2f" : "#f44336"}
            textColor="#fff"
            onPress={async () => {
              await handleLogout(logout)
            }}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            contentStyle={styles.logoutButtonContent}
          >
            Logout
          </Button>
        </Surface>
        
        {/* App Version Footer */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, {
            color: colorScheme === "dark" ? "#666" : "#999"
          }]}>
            Version 2.1.0
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  focusedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSurface: {
    margin: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  navigationSection: {
    flex: 1,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  logoutSection: {
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  logoutButtonSurface: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButton: {
    borderRadius: 12,
    elevation: 0,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoutButtonContent: {
    height: 50,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

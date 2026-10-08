import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '@/context/AuthContext';
import Feather from '@expo/vector-icons/Feather';

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

interface DrawerItem {
  name: string;
  label: string;
  icon: string;
  color: string;
  requiresAuth?: string;
}

const drawerItems: DrawerItem[] = [
  {
    name: 'Home',
    label: 'Dashboard',
    icon: 'grid',
    color: '#3b82f6',
    requiresAuth: 'home',
  },
  {
    name: 'coalSampling',
    label: 'Coal Sampling',
    icon: 'fire',
    color: '#ef4444',
    requiresAuth: 'coalSampling',
  },
  {
    name: 'biomassSampling',
    label: 'Biomass Sampling',
    icon: 'leaf',
    color: '#10b981',
    requiresAuth: 'biomassSampling',
  },
  {
    name: 'vehicleStatus',
    label: 'Vehicle Status',
    icon: 'truck',
    color: '#228dff',
    requiresAuth: 'vehicleStatus',
  },
  {
    name: 'Reports',
    label: 'Reports',
    icon: 'bar-chart-2',
    color: '#f59e0b',
    requiresAuth: 'reports',
  },
  {
    name: 'Settings',
    label: 'Settings',
    icon: 'settings',
    color: '#6b7280',
    requiresAuth: 'settings',
  },
];

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);

  const filteredItems = drawerItems.filter((item) => {
    if (!item.requiresAuth) return true;
    return user?.userAuthorizations?.some(
      (auth: any) => auth.path === item.requiresAuth
    );
  });

  const handleLogout = async () => {
    await logout();
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* Header Section */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('@/assets/images/tspl-logo.jpeg')}
            style={styles.drawerLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appTitle}>TSPL LIMS</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Navigation Items */}
      <View style={styles.navSection}>
        {filteredItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => {
              props.navigation.navigate(item.name);
              props.navigation.closeDrawer();
            }}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
              props.state.index === index && styles.navItemActive,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Feather name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.navItemContent}>
              <Text style={styles.navItemLabel}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#d1d5db" />
          </Pressable>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.userHeader}>
          <Text style={styles.userHeaderTitle}>Account</Text>
        </View>
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {user.fullname?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.fullname}
              </Text>
              <Text style={styles.userRole} numberOfLines={1}>
                {user.rolE_NM || 'User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.emailid}
              </Text>
            </View>
          </View>
        )}

        <Divider style={[styles.divider, styles.profileDivider]} />

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>TSPL LIMS v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Talwandi Sabo Power Ltd</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export function ModernDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: width * 0.75,
          backgroundColor: '#ffffff',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
        },
        headerTintColor: '#3b82f6',
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: '#6b7280',
      }}
    >
      {/* Your screens will be added here */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerLogo: {
    width: 48,
    height: 48,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    marginVertical: 12,
  },
  navSection: {
    paddingVertical: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  navItemPressed: {
    backgroundColor: '#f3f4f6',
  },
  navItemActive: {
    backgroundColor: '#dbeafe',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navItemContent: {
    flex: 1,
  },
  navItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userHeader: {
    marginBottom: 12,
  },
  userHeaderTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#9ca3af',
  },
  profileDivider: {
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
